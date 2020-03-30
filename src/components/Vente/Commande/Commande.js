import Axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import DatePicker from 'react-datepicker'
import Nouislider from 'nouislider-react'
import ReactTable from 'react-table'
import '../../../vendor/libs/react-table/react-table.scss'
import { Form, Button, Col } from 'react-bootstrap'
import '../../../vendor/libs/react-select/react-select.scss'
import '../../../vendor/libs/nouislider-react/nouislider-react.scss'
import '../../../vendor/libs/react-datepicker/react-datepicker.scss'
import { useFilter } from '../../../filter'

class Commande extends Component {
	constructor(props) {
		super(props)

		this.actions = [
			{
				text: 'Créer',
				icon: 'create',
				handler: () =>
					this.setState({
						addRedirect: true
					})
			}
		]

		this.dates = ['start', 'end']

		this.options = [
			{
				label: 'Toute'
			},
			{
				label: 'Validée'
			},
			{
				label: 'Non validée'
			}
		]

		this.state = {
			startDate: new Date(),
			endDate: new Date(),
			rangeValue: [0, 1000],
			selected: [],
			filtered: [],
			data: [],
			update: {},
			editRedirect: false,
			maxPrice: 1000,
			error: [],
			notLogged: false
		}

		Axios.get(`/api/order/sell`)
			.then(({ data }) => {
				const getMinDate = arr =>
					arr
						.map(({ date }) => new Date(date))
						.sort((a, b) => a - b)[0]
				const getMaxPrice = arr => {
					const max = arr
						.map(({ priceT }) => priceT)
						.sort((a, b) => b - a)[0]
					return max + (100 - (max % 100))
				}
				const maxPrice = getMaxPrice(data.orders) || 1000
				this.setState({
					maxPrice,
					rangeValue: [this.state.rangeValue[0], maxPrice],
					startDate: getMinDate(data.orders) || new Date(),
					data: data.orders,
					filtered: data.orders,
					client: [
						...new Set(
							data.orders.map(
								({ client }) => client && client.name
							)
						)
					]
				})
			})
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

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

	isValueChanged(oldVal, newVal) {
		oldVal = Array.isArray(oldVal)
			? oldVal.map(v => parseFloat(v))
			: parseFloat(oldVal)
		newVal = Array.isArray(newVal)
			? newVal.map(v => parseFloat(v))
			: parseFloat(newVal)
		return String(oldVal) !== String(newVal)
	}

	updateValue(key, value) {
		this.setState(state =>
			this.isValueChanged(state[key], value) ? { [key]: value } : null
		)
	}

	filterClient = ({ label }) => {
		let all = this.state.data
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.client && a.client.name === label)
			})
		else this.setState({ filtered: all })
	}

	validate_commande = ref => {
		Axios.patch('/api/order', { reference: ref })
			.then(res => {
				this.setState({ error: '' })
				let command = this.state.filtered.map(ele => {
					if (ele.reference === ref) {
						ele.validated = true
						ele.validationDate = new Date()
					}
					return ele
				})
				this.setState({ filtered: command })
			})
			.catch(err => {
				if (err.response.data && err.response.data.length > 0)
					this.setState({ error: err.response.data })
			})
	}

	delete_commande = ref => {
		Axios.delete('/api/order', { data: { reference: ref } })
			.then(res => {
				let data = this.state.data.filter(ele => ele.reference !== ref)
				let command = this.state.filtered.filter(
					ele => ele.reference !== ref
				)
				this.setState({ filtered: command })
				this.setState({ data: data })
			})
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	render() {
		const columns = [
			{
				Header: 'Valider',
				Cell: ({ row }) =>
					!row._original.validated && (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span
								className='ion ion-md-checkmark text-success mx-4'
								onClick={() =>
									this.validate_commande(
										row._original.reference
									)
								}
								style={{
									cursor: 'pointer',
									transform: 'scale(1.25)'
								}}
							/>
						</div>
					)
			},
			{ Header: 'Référence', accessor: 'reference' },
			{
				Header: 'Création',
				Cell: ({ row }) =>
					moment(row._original.date).format('DD/MM/YYYY')
			},
			{
				Header: 'Confirmation',
				Cell: ({ row }) =>
					row._original.validated
						? moment(row._original.validationDate).format(
								'DD/MM/YYYY'
						  )
						: 'Pas Encore'
			},
			{
				Header: 'Validation',
				Cell: ({ row }) => (row._original.validated ? 'Oui' : 'Non')
			},
			{
				Header: 'Date de livraison',
				Cell: ({ row }) =>
					row._original.stockValidated
						? moment(row._original.stockDate).format('DD/MM/YYYY')
						: 'Pas Encore'
			},
			{
				Header: 'Client',
				Cell: ({ row }) =>
					(row._original.client && row._original.client.name) || '-'
			},
			{ Header: 'Responsable', accessor: 'commercial' },
			{
				Header: 'HT',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.priceT.toFixed(2)}
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
							{row._original.priceTotalTVA.toFixed(2)}
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
							{(
								row._original.priceTotalTVA +
								row._original.priceT
							).toFixed(2)}
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
								this.delete_commande(row._original.reference)
							}
						/>
					</div>
				)
			}
		]

		return (
			<div>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.addRedirect && (
					<Redirect to='/vente/commande/create' />
				)}
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: '/vente/commande/edit',
							state: { commande: this.state.update }
						}}
					/>
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>Commande</div>
					<div className='d-flex justify-content-between align-items-center'>
						<Button
							variant='outline-primary rounded-pill mr-2 d-block'
							onClick={() =>
								this.setState({ addRedirect: true })
							}>
							<span className={'ion ion-ios-create'}></span>
							&nbsp; Créer
						</Button>
					</div>
				</h4>
				{this.state.error.length > 0 && (
					<div className='w-100 font-weight-bold py-3 mb-4'>
						{this.state.error.map((err, i) => (
							<div
								key={i}
								className='alert alert-danger w-100'
								role='alert'>
								{err}
							</div>
						))}
					</div>
				)}
				<div className='ui-bordered px-4 py-4 mb-4'>
					<Form>
						<Form.Group as={Col} md={12} className='mb-5 px-0 pb-3'>
							<Form.Label className='mb-4'>Montant</Form.Label>
							<Nouislider
								connect
								tooltips
								step={100}
								onChange={(str, i, [min, max]) =>
									this.setState({
										filtered: useFilter(
											this.state.data,
											'price',
											{
												min,
												max
											}
										)
									})
								}
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
								<Form.Group key={date} as={Col} md={3}>
									<Form.Label>{`Date (${
										date === 'start' ? 'début' : 'fin'
									})`}</Form.Label>
									<DatePicker
										className='form-control'
										selected={this.state[`${date}Date`]}
										onChange={value =>
											this.handleChange(date, value)
										}
										popperPlacement={this.placement}
									/>
								</Form.Group>
							))}
							<Form.Group as={Col} md={3}>
								<Form.Label>Client</Form.Label>
								<Select
									isSearchable={true}
									className='react-select'
									classNamePrefix='react-select'
									onChange={this.filterClient}
									options={[
										'Toute',
										...new Set(this.state.client)
									].map(name => ({ label: name }))}
								/>
							</Form.Group>
							<Form.Group as={Col} md={3}>
								<Form.Label>Status</Form.Label>
								<Select
									isSearchable={false}
									onChange={({ label }) =>
										this.setState({
											filtered: useFilter(
												this.state.data,
												'bool',
												{
													cb: ({ validated }) =>
														label !== 'Toute'
															? label ===
															  'Validée'
																? validated
																: !validated
															: true
												}
											)
										})
									}
									className='react-select'
									classNamePrefix='react-select'
									options={this.options}
									defaultValue={this.options[0]}
								/>
							</Form.Group>
						</Form.Row>
					</Form>
				</div>
				<div className='card-datatable table-responsive'>
					<ReactTable
						className='-striped -highlight'
						data={this.state.filtered}
						columns={columns}
						defaultPageSize={10}
						previousText='&larr; Précédent'
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

export default Commande
