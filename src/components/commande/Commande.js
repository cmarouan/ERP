import moment from 'moment'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import Select from 'react-select'
import Nouislider from 'nouislider-react'
import { Form, Button, Col } from 'react-bootstrap'
import Axios from 'axios'
import { useFilter } from '../../filter'
import ReactTable from 'react-table'
import DatePicker from 'react-datepicker'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/nouislider-react/nouislider-react.scss'

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
			toLogin: false
		}

		Axios.get(`/api/order/buy`)
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
					providers: [
						...new Set(
							data.orders.map(
								({ provider }) => provider && provider.name
							)
						)
					],
					filtered: data.orders
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

		props.setTitle('Commande')
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

	filterProvider = ({ label }) => {
		let all = this.state.data
		this.setState({
			filtered:
				label === 'Toute'
					? all
					: all.filter(a => a.provider.name === label)
		})
	}

	commandeAction = (type, ref) =>
		Axios[type](
			'/api/order',
			type === 'patch' ? { reference: ref } : { data: { reference: ref } }
		)
			.then(res => {
				const cmp = x => x.reference !== ref.toString()
				const data = this.state.data.filter(cmp)
				const command = this.state.filtered.filter(cmp)
				this.setState({ filtered: command, data: data })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

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
									this.commandeAction(
										'patch',
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
								this.commandeAction(
									'delete',
									row._original.reference
								)
							}
						/>
					</div>
				)
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.addRedirect && (
					<Redirect to='/achat/commande/create' />
				)}
				{this.state.toLogin && <Redirect to='/' />}
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: `/achat/commande/edit`,
							state: { commande: this.state.update }
						}}
					/>
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Commande
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
							<Form.Group as={Col} md={3} className='mb-4'>
								<Form.Label>Fournisseur</Form.Label>
								<Select
									isSearchable={true}
									onChange={this.filterProvider}
									className='react-select'
									classNamePrefix='react-select'
									options={[
										'Toute',
										...new Set(this.state.providers)
									].map(provider => ({ label: provider }))}
								/>
							</Form.Group>
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
									/>
								</Form.Group>
							))}
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
