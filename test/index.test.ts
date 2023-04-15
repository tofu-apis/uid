import { expect, test } from '@jest/globals';
import { getOne } from '../src/index';

test('Dummy Test - Equality', () => {
  expect(getOne().value).toEqual(1);
});
