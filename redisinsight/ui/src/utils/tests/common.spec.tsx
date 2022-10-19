import React from 'react'
import { getNodeText } from '../common'

const getOutputForGetNodeTextTests: any[] = [
  [5, '5'],
  ['5', '5'],
  ['test test', 'test test'],
  [123_4324_432, '1234324432'],
  [<div>123</div>, '123'],
  [<div><span>222</span></div>, '222'],
  [<div><span>111</span><span>222</span></div>, '111222'],
]

describe('getNodeText', () => {
  it.each(getOutputForGetNodeTextTests)('for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getNodeText(reply)
      expect(result).toBe(expected)
    })
})
