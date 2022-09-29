import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { cleanup, mockedStore, render } from 'uiSrc/utils/test-utils'
import WBResults, { Props } from './WBResults'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

/**
 * WBResults tests
 *
 * @group unit
 */
describe('WBResults', () => {
  it('should render', () => {
    expect(render(<WBResults {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should not render NoResults component with empty items', () => {
    const { getByTestId } = render(<WBResults {...instance(mockedProps)} items={[]} />)

    expect(getByTestId('wb_no-results')).toBeInTheDocument()
  })

  it('should render with custom props', () => {
    const itemsMock: CommandExecutionUI[] = [
      {
        id: '1',
        command: 'query1',
        result: [{
          response: 'data1',
          status: 'success'
        }],
      },
      {
        id: '2',
        command: 'query2',
        result: [{
          response: 'data2',
          status: 'success'
        }],
      },
    ]

    expect(render(<WBResults {...instance(mockedProps)} items={itemsMock} />)).toBeTruthy()
  })
})
