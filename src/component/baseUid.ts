import _ from 'lodash';
import {
  Class,
  NonEmptyArray,
  NonEmptyString,
  NonNegativeInt,
  castToNonNegativeInt,
  checkArgument,
} from '@tofu-apis/common-types';
import { UidComponent } from './uidComponent';

export class BaseUid {
  protected readonly domainName: NonEmptyString;
  protected readonly subdomainPath: Array<NonEmptyString>;
  protected readonly entityName: NonEmptyString;
  protected readonly uidComponents: NonEmptyArray<UidComponent>;

  protected constructor(
    domainName: NonEmptyString,
    subdomainPath: Array<NonEmptyString>,
    entityName: NonEmptyString,
    firstUidComponent: UidComponent,
    ...additionalUidComponents: UidComponent[]
  ) {
    this.domainName = domainName;
    this.subdomainPath = subdomainPath;
    this.entityName = entityName;
    this.uidComponents = [firstUidComponent, ...additionalUidComponents];
  }

  protected getUidComponents(): NonEmptyArray<UidComponent> {
    return this.uidComponents;
  }

  protected getNumComponents(): NonNegativeInt {
    return castToNonNegativeInt(this.getUidComponents().length);
  }

  private getComponentAtIndex(index: NonNegativeInt): UidComponent {
    const numComponents = this.getNumComponents();
    if (index >= numComponents) {
      throw new Error(
        `Cannot get uidComponent at index [${index}] since number of components in UID is ${numComponents}.`,
      );
    }

    return this.uidComponents[index];
  }

  protected getComponentOfTypeAtIndex<T extends UidComponent>(
    index: number,
    uidComponentType: Class<T>,
  ): UidComponent {
    const uidComponentIndex = castToNonNegativeInt(index);

    const uidComponent: UidComponent =
      this.getComponentAtIndex(uidComponentIndex);

    checkArgument(
      uidComponent instanceof uidComponentType,
      `UidComponent at index ${uidComponentIndex} should be a ${uidComponentType.name}.`,
    );

    return uidComponent;
  }

  public toString(): string {
    const uidComponentsAsStrings: NonEmptyString[] = _.map(
      this.getUidComponents(),
      (uidComponent) => {
        return uidComponent.toString();
      },
    );

    const fullUidComponentsString: string = _.join(uidComponentsAsStrings, ',');
    const uidEntityPath: string = _.join(
      ['uid', this.domainName, ...this.subdomainPath, this.entityName],
      ':',
    );

    return `${uidEntityPath}(${fullUidComponentsString})`;
  }

  public static fromString<T extends BaseUid>(
    fullUidString: string,
  ): ThisType<T> {
    return this.fromString(fullUidString);
  }
}
