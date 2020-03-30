import React, { Component } from 'react'
import Axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Redirect } from 'react-router'
import { Form, Col, Button } from 'react-bootstrap'
import { useFilter } from '../../filter'
import Nouislider from 'nouislider-react'
import ReactTable from 'react-table'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/nouislider-react/nouislider-react.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-table/react-table.scss'

export default class Note extends Component {
	state = {
		data: [],
		filtered: [],
		endDate: new Date(),
		startDate: new Date(),
		rangeValue: [0, 1000],
		maxPrice: 1000,
		toLogin: false
	}

	actions = [
		{
			text: 'Créer',
			icon: 'create',
			handler: () =>
				this.setState({
					addRedirect: true
				})
		}
	]

	componentRef = []

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
		let t = e.label === 'Remboursable'
		if (e.label === 'Tous') this.setState({ filtered: this.state.data })
		else {
			let filter = this.state.data.filter(ele => ele.refundable === t)
			this.setState({ filtered: filter })
		}
	}

	updateValue = (key, value) => {
		this.setState(state =>
			this.isValueChanged(state[key], value) ? { [key]: value } : null
		)
	}

	deleteNote = ref => {
		Axios.delete('/api/expense', {
			data: { expanseRef: ref }
		})
			.then(res =>
				this.setState({
					filtered: this.state.filtered.filter(
						x => x.reference !== ref
					),
					data: this.state.data.filter(x => x.reference !== ref)
				})
			)
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	componentDidMount() {
		Axios.get('/api/expense/0/150')
			.then(res => {
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
					filtered: res.data
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
				Header: 'Date',
				Cell: ({ row }) =>
					moment(row._original.date).format('DD/MM/YYYY')
			},
			{
				Header: 'Référence',
				accessor: 'reference'
			},
			{
				Header: 'Dépense',
				accessor: 'field'
			},
			{
				Header: 'Validation',
				Cell: ({ row }) => 'Non'
			},
			{
				Header: 'Libellé',
				accessor: 'description'
			},
			{
				Header: 'Remboursable',
				Cell: ({ row }) => (row._original.refundable ? 'Oui' : 'Non')
			},
			{
				Header: 'Type de paiment',
				accessor: 'type'
			},
			{
				Header: 'HT',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.totalHT.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'TVA',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.tva + '%'}
						</span>
					</div>
				)
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
				Header: 'Éditer',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							style={{ cursor: 'pointer' }}
							className='ion ion-md-create text-primary'
							onClick={() =>
								this.setState({
									editRedirect: true,
									update: row._original
								})
							}
						/>
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
							style={{ cursor: 'pointer' }}
							className='ion ion-md-trash text-danger'
							onClick={() =>
								this.deleteNote(row._original.reference)
							}
						/>
					</div>
				)
			}
		]
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: `/note de frais/note/edit`,
							state: { note: this.state.update }
						}}
					/>
				)}
				{this.state.toLogin && <Redirect to='/' />}
				{this.state.addRedirect && (
					<Redirect to='/note de frais/note/add' />
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Note de Frais
					<div className='d-flex justify-content-between align-items-center'>
						{this.actions.map((action, i) => (
							<Button
								key={i}
								onClick={action.handler}
								variant='outline-primary rounded-pill mr-2 d-block'>
								<span
									className={`ion ion-ios-${action.icon}`}></span>
								&nbsp;
								{action.text}
							</Button>
						))}
					</div>
				</h4>
				<div className='ui-bordered px-4 py-4 mb-4'>
					<Form>
						<Form.Group as={Col} md={12} className='mb-5 px-0 pb-3'>
							<Form.Label className='mb-4'>Prix</Form.Label>
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
								<Form.Label>Type</Form.Label>
								<Select
									onChange={this.filterType}
									className='react-select'
									options={[
										{
											label: 'Tous'
										},
										{
											label: 'Remboursable'
										},
										{
											label: 'Non remboursable'
										}
									]}
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
