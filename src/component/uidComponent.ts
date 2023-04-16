import { Int } from '@tofu-apis/common-types';
import { NonEmptyString } from '@tofu-apis/common-types';
import { BaseUid } from './baseUid';

export type UidComponentType = NonEmptyString | Int | BaseUid;

export interface UidComponent {
  toString(): string;
}

export class StringUidComponent implements UidComponent {
  private stringValue: NonEmptyString;

  public constructor(stringValue: string) {
    this.stringValue = stringValue;
  }

  public toString(): string {
    return this.stringValue;
  }

  public static fromString(uidComponentString: string): StringUidComponent {
    return this.constructor(uidComponentString);
  }
}

export function isStringUidComponent(
  uidComponent: UidComponent,
): uidComponent is StringUidComponent {
  return uidComponent instanceof StringUidComponent;
}

export class IntUidComponent implements UidComponent {
  private intValue: Int;

  public constructor(intValue: Int) {
    this.intValue = intValue;
  }

  public toString(): string {
    return this.intValue.toString();
  }
}

export function isIntUidComponent(
  uidComponent: UidComponent,
): uidComponent is IntUidComponent {
  return uidComponent instanceof IntUidComponent;
}

export class UidBasedUidComponent implements UidComponent {
  private uidValue: BaseUid;

  public constructor(uidValue: BaseUid) {
    this.uidValue = uidValue;
  }

  public toString(): string {
    return this.uidValue.toString();
  }
}

export function isUidBasedUidComponent(
  uidComponent: UidComponent,
): uidComponent is UidBasedUidComponent {
  return uidComponent instanceof UidBasedUidComponent;
}

// Pretty sure we don't need this since each child UID class has a fromString() method.
// export class UidComponentDeserializer {
//   public static deserializeInt(uidComponentString: string): IntUidComponent {
//     return new IntUidComponent(stringToInt(uidComponentString));
//   }
//
//   public static deserializeString(
//     uidComponentString: string,
//   ): StringUidComponent {
//     return new StringUidComponent(uidComponentString);
//   }
//
//   public static deserializeUid<T extends BaseUid>(
//     uidComponentString: string,
//     uidType: T,
//   ): UidBasedUidComponent {
//     return new UidBasedUidComponent(uidType.fromString(uidComponentString));
//   }
// }
