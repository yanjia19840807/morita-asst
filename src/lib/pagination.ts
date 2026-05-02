export const DefaultPageSize = 10

export const getActivePage = (
  page: number = 1,
  pageSize: number,
  total: number
) => {
  const maximumSize = getMaximumPage(pageSize, total)
  return page <= maximumSize ? (page <= 0 ? 1 : page) : 1
}

export const getMaximumPage = (pageSize: number, total: number) => {
  let maximumPage = 1
  while (maximumPage * pageSize < total) {
    maximumPage++
  }
  return maximumPage
}

export const getPagesToShow = (
  maximumSize: number,
  activePage: number,
  totalNumberToShow: number
) => {
  let topFivePageNumber: number[] = []
  const partitionValue = Math.floor(totalNumberToShow / 2)
  // left half values based on partition value, always starts at 1
  const leastLeftPartitionValues = Array.from({ length: partitionValue }).map(
    (_, index) => index + 1
  )

  // right half values based on partition value, maximum size possible, and total number to show
  const greatestRightPartitionValues = Array.from({
    length: partitionValue
  })
    .map(
      (_, index) =>
        (maximumSize < totalNumberToShow ? totalNumberToShow : maximumSize) -
        index
    )
    .reverse()
  if (leastLeftPartitionValues.includes(activePage)) {
    topFivePageNumber = [...leastLeftPartitionValues]
    Array.from({
      length: totalNumberToShow - leastLeftPartitionValues.length
    }).forEach((_, index) =>
      topFivePageNumber.push(
        leastLeftPartitionValues[leastLeftPartitionValues.length - 1] +
          (index + 1)
      )
    )
  } else if (greatestRightPartitionValues.includes(activePage)) {
    const leftPageNumbers: number[] = []
    Array.from({
      length: totalNumberToShow - greatestRightPartitionValues.length
    }).forEach((_, index) =>
      leftPageNumbers.push(greatestRightPartitionValues[0] - (index + 1))
    )
    topFivePageNumber = [
      ...leftPageNumbers.reverse(),
      ...greatestRightPartitionValues
    ]
  } else {
    const leftPageNumbers: number[] = []
    const rightPageNumbers: number[] = []
    Array.from({ length: partitionValue }).forEach((_, index) =>
      leftPageNumbers.push(activePage - (index + 1))
    )
    Array.from({ length: partitionValue }).forEach((_, index) =>
      rightPageNumbers.push(activePage + (index + 1))
    )
    topFivePageNumber = [
      ...leftPageNumbers.reverse(),
      activePage,
      ...rightPageNumbers
    ]
  }
  return topFivePageNumber
}

export function getPage(value: unknown): number {
  const num = parseInt(String(value), 10)
  return isNaN(num) || num <= 0 ? 1 : num
}
