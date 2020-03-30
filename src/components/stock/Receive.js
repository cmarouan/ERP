import axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import React, { Component } from 'react'
import { useFilter } from '../../filter'
import { Alert } from 'react-bootstrap'
import ReactTable from 'react-table'
import DatePicker from 'react-datepicker'
import { Redirect } from 'react-router-dom'
import { Form, Button, Col } from 'react-bootstrap'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-table/react-table.scss'

export default class Receive extends Component {
	state = {
		data: [],
		filtered: [],
		startDate: new Date(),
		endDate: new Date(),
		providersFiltred: [],
		message: '',
		notLogged: false
	}

	dates = ['start', 'end']

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

	filterProvider = e => {
		if (e.label) {
			if (e.label === 'Toute')
				this.setState({ filtered: this.state.data })
			else {
				let filter = this.state.data.filter(ele => {
					return ele.provider && ele.provider.name === e.label
				})
				this.setState({ filtered: filter })
			}
		}
	}

	componentDidMount() {
		axios
			.get('/api/stock/receive')
			.then(async res => {
				const allOrders = res.data.orders ? res.data.orders : []
				let all = allOrders.map(
					pro => pro.provider && pro.provider.name
				)
				this.setState({
					providersFiltred: [...new Set(all)],
					data: allOrders,
					filtered: allOrders,
					providers: [
						...new Set(
							allOrders.map(
								({ provider }) => provider && provider.name
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

	shipCommande(ref) {
		axios
			.patch('/api/stock/receive', { orderBC: ref })
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
								className='ion ion-md-checkmark text-success'
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
				Header: 'Réception',
				Cell: ({ row }) =>
					row._original.stockValidated
						? moment(row.stockDate).format('DD/MM/YYYY')
						: 'Pas Encore'
			},
			{
				Header: 'Fournisseur',
				Cell: ({ row }) =>
					(row._original.provider && row._original.provider.name) ||
					'-'
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
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Réception
					<div className='d-flex justify-content-between align-items-center'>
						<Button
							variant='outline-primary rounded-pill mr-2 d-block'
							onClick={() => {}}>
							<span className={'ion ion-ios-create'}></span>
							&nbsp; Importer
						</Button>
					</div>
				</h4>
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
							<Form.Label>Fournisseur</Form.Label>
							<Select
								onChange={this.filterProvider}
								className='react-select'
								options={[
									'Toute',
									...new Set(this.state.providers)
								].map(provider => ({ label: provider }))}
								classNamePrefix='react-select'
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
