import moment from 'moment'

const dateInRange = (date, start, end) =>
	moment(date).isAfter(moment(start)) && moment(date).isBefore(moment(end))

const filterDate = (arr, start, end, dateKey) =>
	arr.filter(cur => dateInRange(cur[dateKey], start, end))

const filterPrice = (arr, min, max) =>
	arr.filter(({ priceT }) => priceT >= min && priceT <= max)

const filterPrice2 = (arr, min, max) =>
	arr.filter(({ total }) => total >= min && total <= max)

export const useFilter = (arr, key, opts) => {
	switch (key) {
		case 'date':
			return filterDate(arr, opts.start, opts.end, opts.key)
		case 'price':
			return filterPrice(arr, opts.min, opts.max)
		case 'total':
			return filterPrice2(arr, opts.min, opts.max)
		case 'bool':
			return arr.filter(opts.cb)
		default:
			return arr
	}
}
