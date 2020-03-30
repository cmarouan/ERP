import React, { Component } from 'react'
import axios from 'axios'
import moment from 'moment'
import Select from 'react-select'
import { useFilter } from '../../filter'
import DatePicker from 'react-datepicker'
import { Form, Col } from 'react-bootstrap'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/nouislider-react/nouislider-react.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import ReactTable from 'react-table'
import '../../vendor/libs/react-table/react-table.scss'
import { Redirect } from "react-router-dom";

export default class History extends Component {
	state = {
		data: [],
		filtered: [],
		startDate: new Date(),
		endDate: new Date(),
		toLogin: false
	}

	dates = ['start', 'end']

	filterResponsable = e => {
		if (e.label === 'Toute') this.setState({ filtered: this.state.data })
		else {
			let filter = this.state.data.filter(
				ele => ele.commercial.username === e.label
			)
			this.setState({ filtered: filter })
		}
	}

	filterAction = e => {
		let action = 1
		if (e.label === 'Toute') this.setState({ filtered: this.state.data })
		else {
			if (e.label === 'Modification') action = 2
			else if (e.label === 'Supression') action = 3
			else if (e.label === 'Validation') action = 4
			let filter = this.state.data.filter(ele => ele.action === action)
			this.setState({ filtered: filter })
		}
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
			.get('/api/history/buy')
			.then(res => {
				this.setState({
					data: res.data || [],
					filtered: res.data || [],
					resposables: [
						...new Set(
							res.data.map(
								({ commercial }) => commercial.username
							)
						)
					]
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({toLogin : true});
			})
	}

	render() {
		const columns = [
			{
				Header: 'Date',
				Cell: ({ row }) =>
					row._original.date
						? moment(row._original.date).format(
								'DD/MM/YYYY'
						  )
						: 'Pas Encore'
			},
			{
				 Header: 'Responsable',
				 Cell: ({ row }) =>
					 (row._original.commercial && row._original.commercial.username) ||
					 '-'
			},
			{ 
				Header: 'Action',
				Cell: ({ row }) =>
					((row._original.action === 1 && 'Création' )
					||  (row._original.action === 2 && 'Modification') 
					||  (row._original.action === 3 && 'Supression') 
					||  (row._original.action === 4 && 'Validation') )
			},
			{ Header: 'Document', accessor: 'document' }
		]
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.toLogin && <Redirect to="/" />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>Historique</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form>
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
							<Form.Group as={Col} md={3} className='mb-3'>
								<Form.Label>Responsable</Form.Label>
								<Select
									onChange={this.filterResponsable}
									className='react-select'
									options={[
										'Toute',
										...new Set(this.state.resposables)
									].map(resposable => ({
										label: resposable
									}))}
									classNamePrefix='react-select'
								/>
							</Form.Group>
							<Form.Group as={Col} md={3} className='mb-3'>
								<Form.Label>Action</Form.Label>
								<Select
									onChange={this.filterAction}
									className='react-select'
									options={[
										{
											label: 'Toute'
										},
										{
											label: 'Création'
										},
										{
											label: 'Modification'
										},
										{
											label: 'Supression'
										},
										{
											label: 'Validation'
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
