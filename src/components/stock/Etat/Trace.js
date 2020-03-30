import axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Col } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import ReactTable from 'react-table'
import { useFilter } from '../../../filter'
import '../../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../../vendor/libs/react-select/react-select.scss'
import '../../../vendor/libs/react-table/react-table.scss'

export default class Trace extends Component {
	state = {
		date: [],
		filtered: [],
		articles: {},
		startDate: new Date(),
		notLogged: false,
		endDate: new Date()
	}

	dates = ['start', 'end']

	filterAction = e => {
		let action = 1
		if (e.label === 'Toute')
			return this.setState({ filtered: this.state.data })
		if (e.label === 'Ajustement') action = 2
		else if (e.label === 'livraison') action = 3
		let filter = this.state.data.filter(ele => ele.action === action)
		this.setState({ filtered: filter })
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

	componentDidMount() {
		axios
			.get('/api/history/article')
			.then(res => {
				const getMinDate = arr =>
					arr
						.map(({ date }) => new Date(date))
						.sort((a, b) => a - b)[0]
				const allArticles = res.data ? res.data : []
				this.setState({
					data: allArticles,
					filtered: allArticles,
					startDate: getMinDate(allArticles),
					resposables: [
						...new Set(
							res.data.map(
								({ commercial }) => commercial.username
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
		axios
			.get('/api/article')
			.then(res =>
				this.setState({
					articles: res.data.articles.reduce((acc, { _id, name }) => {
						acc[_id] = name
						return acc
					}, {})
				})
			)
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	render() {
		const columns = [
			{
				Header: 'Date',
				Cell: ({ row }) =>
					moment(row._original.date).format('DD/MM/YYYY')
			},
			{
				Header: 'Article',
				Cell: ({ row }) => this.state.articles[row._original.document]
			},
			{
				Header: 'Responsable',
				Cell: ({ row }) => row._original.commercial.username
			},
			{
				Header: 'Mouvement',
				Cell: ({ row }) =>
					['Réception', 'Ajustement', 'Livraison'][
						row._original.action - 1
					]
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.traceRedirect && <Redirect to='/stock/trace' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Traçabilité
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
								/>
							</Form.Group>
						))}
						<Form.Group as={Col} md={4} className='mb-3'>
							<Form.Label>Mouvement</Form.Label>
							<Select
								onChange={this.filterAction}
								className='react-select'
								options={[
									{
										label: 'Toute'
									},
									{
										label: 'réception'
									},
									{
										label: 'Ajustement'
									},
									{
										label: 'livraison'
									}
								]}
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
			</div>
		)
	}
}
