import { getNextRecordValue } from '../lib/cache'

describe('getNextRecordValue', () => {
  it('should retrun next index', () => {
    expect(getNextRecordValue({ foo: 100 })).toEqual(101)
    expect(getNextRecordValue({ one: 1, two: 2 })).toEqual(3)
    expect(getNextRecordValue({ one: 1, two: 2, ten: 10 })).toEqual(11)
  })
  it('should retrun 0 if list is empty', () => {
    expect(getNextRecordValue({})).toEqual(0)
  })
})
