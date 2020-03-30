import Axios from 'axios'
import Select from 'react-select'
import ReactTable from 'react-table'
import { prop, map } from 'ramda'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Form, Col, Button } from 'react-bootstrap'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'

export default class Reglement extends Component {
	state = {
		data: [],
		filtered: [],
		toLogin: false,
		commercials: [],
		clients: []
	}

	filterCommercial = e => {
		if (e.label === 'Toute') this.setState({ filtered: this.state.data })
		else {
			let filter = this.state.data.filter(
				ele => ele.commercial === e.label
			)
			this.setState({ filtered: filter })
		}
	}

	getClientFactures = label =>
		this.getFactureListFromServer(
			label !== 'Toute'
				? `/api/facture/payment/client/${label}`
				: undefined
		)

	componentDidMount() {
		this.getFactureListFromServer()
		Axios.get('/api/client/names')
			.then(({ data }) => data.clients.map(x => x.name))
			.then(clients => this.setState({ clients }))
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	getFactureListFromServer = (url = '/api/facture/payment/0/150') =>
		Axios.get(url)
			.then(res =>
				this.setState({
					data: res.data,
					filtered: res.data,
					commercials: [...new Set(map(prop('commercial'), res.data))]
				})
			)
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

	render() {
		const columns = [
			{
				Header: 'Commercial',
				accessor: 'commercial'
			},
			{
				Header: 'Type',
				accessor: 'type'
			},
			{
				Header: 'Montant',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.payment.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Client',
				Cell: ({ row }) =>
					row._original.client ? row._original.client.name : '-'
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='w-100 font-weight-bold py-3 mb-4'>Règlement</h4>
				<div className='ui-bordered px-4 py-4 mb-4'>
					<Form.Row
						style={{
							alignItems: 'center',
							justiifyContent: 'center'
						}}>
						<Form.Group as={Col} md={5} className='mb-3'>
							<Form.Label>Client</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								options={map(x => ({ label: x }), [
									'Toute',
									...this.state.clients
								])}
								onChange={({ label }) => {
									console.log(label)
									return label
										? this.getClientFactures(label)
										: null
								}}
							/>
						</Form.Group>
						<Form.Group as={Col} md={5} className='mb-3'>
							<Form.Label>Commercial</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								onChange={this.filterCommercial}
								options={map(x => ({ label: x }), [
									'Toute',
									...this.state.commercials
								])}
							/>
						</Form.Group>
						<Col xs={2} className='d-flex'>
							<Button
								onClick={() => this.getFactureListFromServer()}
								variant='primary'
								className='mt-2 ml-auto'>
								Réinitialiser
							</Button>
						</Col>
					</Form.Row>
				</div>
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
		)
	}
}
