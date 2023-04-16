import _ from 'lodash';
import { NonEmptyArray } from '@tofu-apis/common-types';
import { NonEmptyString } from '@tofu-apis/common-types';
import { checkArgument } from '@tofu-apis/common-types';
import { ExtractUid, UidString } from '../component/uidString';

export function validateExtractedUid(
  extractedUid: ExtractUid<UidString>,
  domainName: NonEmptyString,
  subdomainPath: Array<NonEmptyString>,
  entityName: NonEmptyString,
  uidCommponentValidators: NonEmptyArray<(input: string) => boolean>,
): void {
  checkArgument(
    extractedUid.domainName === domainName,
    `Domain name for extractedUid ${JSON.stringify(
      extractedUid,
    )} does not match domainName: ${domainName}`,
  );

  checkArgument(
    extractedUid.subdomainPath.length === subdomainPath.length,
    `The extracted subdomain path ${JSON.stringify(
      extractedUid.subdomainPath,
    )} length does not match the length of the subdomain path to check against ${JSON.stringify(
      subdomainPath,
    )}`,
  );
  _.forEach(extractedUid.subdomainPath, (extractedSubdomainPart, index) => {
    const subdomainPartToCheck = subdomainPath[index];

    checkArgument(
      extractedSubdomainPart === subdomainPartToCheck,
      `Subdomain Path part for extractedUid ${JSON.stringify(
        extractedUid,
      )} at index ${index} does not match subdomainPath to check against: ${subdomainPartToCheck}`,
    );
  });

  checkArgument(
    extractedUid.entityName === entityName,
    `EntityName for extractedUid ${JSON.stringify(
      extractedUid,
    )} does not match entityName: ${entityName}`,
  );

  checkArgument(
    extractedUid.uidComponentStrings.length === uidCommponentValidators.length,
    `The number of uidComponents in extractedUid ${JSON.stringify(
      extractedUid,
    )} must match the number of uid component validators: ${
      uidCommponentValidators.length
    }`,
  );

  extractedUid.uidComponentStrings.forEach((uidComponentString, index) => {
    checkArgument(
      uidCommponentValidators[index](uidComponentString),
      `Uid component string ${uidComponentString} at index ${index} is not valid according to uid component validator at index ${index}`,
    );
  });
}
