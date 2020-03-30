import Axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import { Form, Col } from 'react-bootstrap'
import { useFilter } from '../../filter'
import Nouislider from 'nouislider-react'
import ReactTable from 'react-table'
import { Redirect } from 'react-router-dom'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/nouislider-react/nouislider-react.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-table/react-table.scss'

export default class ToFacture extends Component {
	state = {
		data: [],
		filtered: [],
		startDate: new Date(),
		endDate: new Date(),
		rangeValue: [0, 1000],
		maxPrice: 1000,
		toLogin: false
	}

	dates = ['start', 'end']

	setDates({
		startDate = this.state.startDate,
		endDate = this.state.endDate
	}) {
		if (moment(startDate).isAfter(endDate)) {
			endDate = startDate
		}
		this.setState({
			startDate,
			endDate
		})
	}

	handleChange = (type, date) => {
		this.setDates({ [`${type}Date`]: date })
		this.setState({
			filtered: useFilter(this.state.data, 'date', {
				start: this.state.startDate,
				end: this.state.endDate,
				[type]: date,
				key: 'date'
			})
		})
	}

	filterResponsable = e => {
		if (e.label === 'tous') this.setState({ filtered: this.state.data })
		else {
			let filter = this.state.data.filter(
				ele => ele.commercial === e.label
			)
			this.setState({ filtered: filter })
		}
	}

	isValueChanged = (oldVal, newVal) => {
		oldVal = Array.isArray(oldVal)
			? oldVal.map(v => parseFloat(v))
			: parseFloat(oldVal)
		newVal = Array.isArray(newVal)
			? newVal.map(v => parseFloat(v))
			: parseFloat(newVal)
		return String(oldVal) !== String(newVal)
	}

	filterType = e => {
		let t = e.label === 'Achat' ? 1 : -1
		if (e.label === 'Tous') this.setState({ filtered: this.state.data })
		else {
			let filter = this.state.data.filter(ele => ele.type === t)
			this.setState({ filtered: filter })
		}
	}

	updateValue = (key, value) => {
		this.setState(state =>
			this.isValueChanged(state[key], value) ? { [key]: value } : null
		)
	}

	validate_facture = ref => {
		Axios.patch('/api/facture', { reference: ref })
			.then(res => {
				let facture = this.state.filtered.map(ele => {
					if (ele.reference === ref) {
						ele.facture = true
					}
					return ele
				})
				this.setState({ filtered: facture })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	delete_factue = ref => {
		Axios.delete('/api/facture', { data: { reference: ref } })
			.then(res => {
				let data = this.state.data.filter(ele => ele.reference !== ref)
				let facture = this.state.filtered.filter(
					ele => ele.reference !== ref
				)
				this.setState({ filtered: facture })
				this.setState({ data: data })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	componentDidMount() {
		Axios.get('/api/facture/invalid/0/100')
			.then(res => {
				console.log(res.data)
				const getMaxPrice = arr => {
					const max = arr
						.map(({ total }) => total)
						.sort((a, b) => b - a)[0]
					return max + (100 - (max % 100))
				}
				const maxPrice = getMaxPrice(res.data) || 1000
				this.setState({
					maxPrice,
					rangeValue: [this.state.rangeValue[0], maxPrice],
					data: res.data,
					filtered: res.data,
					resposables: [
						...new Set(res.data.map(({ commercial }) => commercial))
					]
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}
	render() {
		const columns = [
			{
				Header: 'Validation',
				Cell: ({ row }) =>
					!row._original.facture && (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span
								className='ion ion-md-checkmark text-success'
								onClick={() =>
									this.validate_facture(
										row._original.reference
									)
								}
								style={{
									transform: 'scale(1.25)',
									cursor: 'pointer'
								}}
							/>
						</div>
					)
			},
			{
				Header: 'Référence',
				accessor: 'reference'
			},
			{
				Header: 'N° de facture',
				accessor: 'reference'
			},
			{
				Header: 'Client',
				Cell: ({ row }) =>
					row._original.order
						? row._original.order.provider
							? row._original.order.provider.name
							: row._original.order.client.name
						: 'NONE'
			},
			{
				Header: 'Commerciale',
				accessor: 'commercial'
			},
			{
				id: "Date d'écheance",
				Header: "Date d'écheance",
				accessor: row =>
					row.date
						? moment(row.date).format('DD/MM/YYYY')
						: 'Pas Encore'
			},
			{
				id: 'Source',
				Header: 'Source',
				accessor: row => (row.type === -1 ? 'BL' : 'BR')
			},
			{
				Header: 'TTC',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.total.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Supprimer',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							onClick={() =>
								this.delete_factue(row._original.reference)
							}
							className='ion ion-md-trash text-danger'
							style={{
								cursor: 'pointer'
							}}
						/>
					</div>
				)
			}
		]
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				<h4 className='w-100 font-weight-bold py-3 mb-4'>À facturer</h4>
				{this.state.toLogin && <Redirect to='/' />}
				<div className='ui-bordered px-4 py-4 mb-4'>
					<Form>
						<Form.Group as={Col} md={12} className='mb-5 px-0 pb-3'>
							<Form.Label className='mb-4'>Montant</Form.Label>
							<Nouislider
								connect
								tooltips
								step={100}
								onChange={(str, i, [min, max]) => {
									this.setState({
										filtered: useFilter(
											this.state.data,
											'total',
											{
												min,
												max
											}
										)
									})
								}}
								behaviour='tap-drag'
								className='noUi-primary mt-3 mx-3'
								start={this.state.rangeValue}
								onSet={val =>
									this.updateValue('rangeValue', val)
								}
								range={{
									min: [0],
									max: [+this.state.maxPrice]
								}}
							/>
						</Form.Group>
						<Form.Row>
							{this.dates.map(date => (
								<Form.Group key={date} as={Col} md={4}>
									<Form.Label>{`Date (${
										date === 'start' ? 'début' : 'fin'
									})`}</Form.Label>
									<DatePicker
										className='form-control'
										selected={this.state[`${date}Date`]}
										onChange={value =>
											this.handleChange(date, value)
										}
									/>
								</Form.Group>
							))}
							<Form.Group as={Col} md={4} className='mb-3'>
								<Form.Label>Responsable</Form.Label>
								<Select
									onChange={this.filterResponsable}
									className='react-select'
									options={[
										'tous',
										...new Set(this.state.resposables)
									].map(resposable => ({
										label: resposable
									}))}
									classNamePrefix='react-select'
								/>
							</Form.Group>
						</Form.Row>
					</Form>
				</div>
				<div className='card-datatable table-responsive pt-4'>
					<ReactTable
						className='-striped -highlight'
						data={this.state.filtered}
						columns={columns}
						defaultPageSize={10}
						previousText='&larr; Precedent'
						nextText='Suivant &rarr;'
						sortable={false}
						loadingText='Chargement...'
						noDataText='Vide'
						pageText='Page'
						ofText='sur'
						rowsText='lignes'
					/>
				</div>
			</div>
		)
	}
}
