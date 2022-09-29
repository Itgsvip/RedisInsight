import { formatLongName, formatNameShort, getDbIndex } from 'uiSrc/utils'

const longName = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut varius massa. Vestibulum non nulla turpis. '
  + 'Morbi non viverra risus. Curabitur aliquet lorem at interdum ultrices. Praesent accumsan leo sit amet purus vestibulum, non placerat sem vestibulum. '
  + 'Cras mattis tempus vulputate. Nam in libero.'

/**
 * formatLongName tests
 *
 * @group unit
 */
describe('formatLongName', () => {
  it('should format long names', () => {
    expect(formatLongName(longName, 50, 10, '...')).toEqual('Lorem ipsum dolor sit amet, consectet...in libero.')
    expect(formatLongName(longName, 10, 5, '...')).toEqual('Lo...bero.')
    expect(formatLongName(longName, 30, 1, '  ')).toEqual('Lorem ipsum dolor sit amet,  .')
  })
})

/**
 * getDbIndex tests
 *
 * @group unit
 */
describe('getDbIndex', () => {
  it('should format long names', () => {
    expect(getDbIndex(0)).toEqual('')
    expect(getDbIndex(1)).toEqual('[1]')
    expect(getDbIndex(10)).toEqual('[10]')
  })
})

/**
 * formatNameShort tests
 *
 * @group unit
 */
describe('formatNameShort', () => {
  it('should format long values', () => {
    expect(formatNameShort(longName)).toEqual('Lorem ipsum dolor sit amet, consectetur adipiscing... Nam in libero.')
  })
})
