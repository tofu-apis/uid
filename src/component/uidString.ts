import _ from 'lodash';
import { NonEmptyArray, castToNonEmptyString } from '@tofu-apis/common-types';
import { NonEmptyString, requireArrayNonEmpty } from '@tofu-apis/common-types';
import { checkArgument } from '@tofu-apis/common-types';
import { Split } from '@tofu-apis/common-types';

/*
  We attempt to keep this simple for performance reasons (worth future consideration)
  and given that we do have some semblance of strong typing and we will enforce
  strict strings in each of the UID classes themselves.

  Note: We allow _ within the uid components since natural foreign keys may exist
  that have an _ in the string ids. These natural foreign keys may have use cases
  where uids should be constructed from them for uniqueness purposes.
 */
const UID_REGEX = /^uid:([a-zA-Z-:]{2,})\(([a-zA-Z-0-9_\(\):,]+)\)$/;

export type UidString =
  `uid:${NonEmptyString}:${NonEmptyString}(${NonEmptyString})`;

export function isUidString(inputString: string): inputString is UidString {
  return UID_REGEX.test(inputString);
}

export function castToUidString(inputString: string): UidString {
  checkArgument(
    isUidString(inputString),
    `Input string ${inputString} cannot be cast to a uidString format.`,
  );

  return inputString as UidString;
}

export type ExtractUid<FullUidString extends UidString> =
  FullUidString extends `uid:${infer DomainName}${infer SubdomainPathString}:${infer EntityName}(${infer UidComponentString})`
    ? {
        domainName: DomainName;
        subdomainPath: Split<SubdomainPathString, ':'>;
        entityName: EntityName;
        uidComponentStrings: Split<UidComponentString, ','>;
      }
    : never;

function splitUidComponentStrings(
  fullUidComponentsString: string,
): NonEmptyArray<NonEmptyString> {
  const uidComponentStrings: string[] = [];

  let currentUidComponent = '';
  let currentNestedParensStackCount = 0;

  for (const char of fullUidComponentsString) {
    if (currentNestedParensStackCount === 0) {
      if (char === ',') {
        checkArgument(
          currentUidComponent.length > 0,
          `Current uidComponent from fullUidComponentsString [${fullUidComponentsString}] being extracted must have a non-zero length.`,
        );
        uidComponentStrings.push(currentUidComponent);
        currentUidComponent = '';
      } else {
        if (char === '(') {
          currentNestedParensStackCount += 1;
        } else if (char === ')') {
          currentNestedParensStackCount -= 1;
        }

        currentUidComponent += char;
      }
    } else {
      if (char === '(') {
        currentNestedParensStackCount += 1;
      } else if (char === ')') {
        currentNestedParensStackCount -= 1;
      }

      currentUidComponent += char;
    }
  }

  checkArgument(
    currentUidComponent.length > 0,
    `Last uidComponent from fullUidComponentsString [${fullUidComponentsString}] being extracted must have a non-zero length.`,
  );
  checkArgument(
    currentNestedParensStackCount === 0,
    `fullUidComponentsString [${fullUidComponentsString}] should only contain uidComponents with balanced parens.`,
  );
  uidComponentStrings.push(currentUidComponent);

  return requireArrayNonEmpty(uidComponentStrings);
}

export function extractUid(uidString: UidString): ExtractUid<UidString> {
  const regexMatchResult = UID_REGEX.exec(uidString);

  if (regexMatchResult === null) {
    throw new Error(
      `Input string is not a valid UID [${uidString}]. ` +
        `This could be an internal UID construction error or could indicate ` +
        `invalid external UID construction.`,
    );
  }

  const [_unusedFullUidString, domainPath, fullUidComponentsString] =
    regexMatchResult;

  const domainPathElements: NonEmptyArray<NonEmptyString> =
    requireArrayNonEmpty(_.split(domainPath, ':'));

  const uidComponentStrings: NonEmptyArray<NonEmptyString> =
    splitUidComponentStrings(fullUidComponentsString);

  const entityName = castToNonEmptyString(domainPathElements.pop());
  const [domainName, ...subdomainPath] = domainPathElements;

  return {
    domainName,
    subdomainPath,
    entityName,
    uidComponentStrings,
  };
}
