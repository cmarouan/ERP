import axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
import { Form, Col, Alert } from 'react-bootstrap'
import { useFilter } from '../../filter'
import ReactTable from 'react-table'
import ReactToPrint from 'react-to-print'
import { Redirect } from 'react-router-dom'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-table/react-table.scss'
import Print from '../Print/Facture'

export default class Deliver extends Component {
	state = {
		startDate: new Date(),
		endDate: new Date(),
		data: [],
		filtered: [],
		notLogged: false,
		message: ''
	}

	dates = ['start', 'end']

	componentRef = []

	options = [
		{
			label: 'Toute'
		},
		{
			label: 'Disponible'
		},
		{
			label: 'Non Disponible'
		}
	]

	delete_commande = ref => {
		axios
			.delete('/api/order', { data: { reference: ref } })
			.then(res => {
				let data = this.state.data.filter(ele => ele.reference !== ref)
				let command = this.state.filtered.filter(
					ele => ele.reference !== ref
				)
				this.setState({ filtered: command, data: data })
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

	handleChange(type, date) {
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

	componentDidMount() {
		axios
			.get('/api/stock/deliver')
			.then(res => {
				const getMinDate = arr =>
					arr
						.map(({ date }) => new Date(date))
						.sort((a, b) => a - b)[0]
				const allOrders = res.data.orders ? res.data.orders : []
				this.setState({
					data: allOrders,
					filtered: allOrders,
					startDate: getMinDate(allOrders),
					clients: [
						...new Set(allOrders.map(({ client }) => client.name))
					]
				})
			})
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	filterProvider = e => {
		if (e.label) {
			if (e.label === 'Toute')
				this.setState({ filtered: this.state.data })
			else {
				let filter = this.state.data.filter(ele => {
					return ele.client && ele.client.name === e.label
				})
				this.setState({ filtered: filter })
			}
		}
	}

	shipCommande(ref) {
		axios
			.patch('/api/stock/deliver', { orderBC: ref })
			.then(res => {
				const updated = this.state.data.map(cur => ({
					...cur,
					stockValidated:
						cur.referenceBC === ref.toString() || cur.stockValidated
				}))
				this.setState({
					message: res.data.message,
					data: updated,
					filtered: updated
				})
				setTimeout(() => this.setState({ message: '' }), 2000)
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
					!row._original.stockValidated && (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span
								className='ion ion-md-checkmark text-success mx-4'
								onClick={() =>
									this.shipCommande(row._original.referenceBC)
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
					moment(row._original.validationDate).format('DD/MM/YYYY')
			},
			{
				Header: 'Livraison',
				Cell: ({ row }) =>
					row._original.stockValidated
						? moment(row.stockDate).format('DD/MM/YYYY')
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
				Header: 'Imprimer',
				Cell: ({ row, index }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<ReactToPrint
							trigger={() => (
								<span
									className='ion ion-md-print text-success'
									style={{
										cursor: 'pointer'
									}}
								/>
							)}
							content={() => this.componentRef[index]}
						/>
						<div className='d-none'>
							{console.log(row._original)}
							<Print
								deliver
								facture={row._original}
								ref={el => (this.componentRef[index] = el)}
							/>
						</div>
					</div>
				)
			}
		]
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				<h4 className='w-100 font-weight-bold py-3 mb-4'>Livraison</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
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
									popperPlacement={this.placement}
								/>
							</Form.Group>
						))}
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Clients</Form.Label>
							<Select
								onChange={this.filterProvider}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									'Toute',
									...new Set(this.state.clients)
								].map(client => ({ label: client }))}
							/>
						</Form.Group>
					</Form.Row>
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
				{this.state.message.length > 0 && (
					<Alert variant='success'>{this.state.message}</Alert>
				)}
			</div>
		)
	}
}
