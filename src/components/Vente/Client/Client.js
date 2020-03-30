import axios from 'axios'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import ReactTable from 'react-table'
import '../../../vendor/libs/react-table/react-table.scss'
import '../../../vendor/libs/react-select/react-select.scss'

export default class Client extends Component {
	state = {
		clients: [],
		notLogged: false,
		filtered: []
	}

	individualFilter = ['Toute', 'Oui', 'Non']

	addRedirect = () => this.setState({ addRedirect: true })

	componentDidMount() {
		axios
			.get('/api/client')
			.then(res => {
				const allClients = res.data.clients ? res.data.clients : []
				console.log(allClients)
				this.setState({
					clients: allClients,
					filtered: allClients,
					types: [...new Set(allClients.map(fi => fi.type))]
				})
			})
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	filterInd = ({ label }) => {
		let all = this.state.clients
		let status = label === 'Non' ? false : true
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.individual === status)
			})
		else this.setState({ filtered: all })
	}

	filterClient = ({ label }) => {
		let all = this.state.clients
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.type === label)
			})
		else this.setState({ filtered: all })
	}

	filterTypeClient = ({ label }) => {
		let all = this.state.clients
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.type === label)
			})
		else this.setState({ filtered: all })
	}

	filterClient = ({ label }) => {
		let all = this.state.clients
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.name === label)
			})
		else this.setState({ filtered: all })
	}

	removeClient(reference) {
		axios
			.delete('/api/client', { data: { reference } })
			.then(res => {
				const refCmp = cur => cur.reference !== reference
				this.setState(state => ({
					clients: state.clients.filter(refCmp),
					filtered: state.filtered.filter(refCmp)
				}))
			})
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	render() {
		const columns = [
			{ Header: 'Client', accessor: 'name' },
			{ Header: 'Référence', accessor: 'reference' },
			{ Header: 'Téléphone', accessor: 'phone' },
			{ Header: 'E-mail', accessor: 'mail' },
			{ Header: 'Type de client', accessor: 'type' },
			{ Header: 'Adresse 1', accessor: 'address' },
			{
				Header: 'Modifier',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							style={{ cursor: 'pointer' }}
							onClick={() =>
								this.setState({
									clientEdit: row._original,
									editRedirect: true
								})
							}
							className='ion ion-md-create text-primary'
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
							onClick={() =>
								this.removeClient(row._original.reference)
							}
							style={{ cursor: 'pointer' }}
							className='ion ion-md-trash text-danger'
						/>
					</div>
				)
			}
		]
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.addRedirect && <Redirect to='/vente/addClient' />}
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: '/vente/editClient',
							state: { client: this.state.clientEdit }
						}}
					/>
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>Client</div>
					<div className='d-flex justify-content-between align-items-center'>
						<Button
							onClick={this.addRedirect}
							variant='outline-primary rounded-pill mr-2 d-block'>
							<span className='ion ion-md-create' />
							&nbsp; Créer
						</Button>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Type de client</Form.Label>
							<Select
								isSearchable={true}
								onChange={this.filterTypeClient}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									'Toute',
									...new Set(this.state.types)
								].map(type => ({ label: type }))}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Client</Form.Label>
							<Select
								isSearchable={true}
								onChange={this.filterClient}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									{ label: 'Toute' },
									...this.state.clients.map(cur => ({
										label: cur.name
									}))
								]}
							/>
						</Form.Group>
					</Form.Row>
				</div>
				<div className='card-datatable table-responsive pt-4'>
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
