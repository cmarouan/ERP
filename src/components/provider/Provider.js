import axios from 'axios'
import { Redirect } from 'react-router'
import React, { Component } from 'react'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import ReactTable from 'react-table'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'

export default class Provider extends Component {
	state = {
		addRedirect: false,
		editRedirect: false,
		providers: [],
		filtered: [],
		location: [],
		individualFilter: ['Non', 'Oui'],
		provEdit: {},
		toLogin: false
	}

	addRedirect = () => this.setState({ addRedirect: true })

	setLocation = () => {
		let loc = this.state.providers.map(fi => fi.deliveryLocation)
		this.setState({ location: loc })
	}

	filterProvider = ({ label }) => {
		let all = this.state.providers
		if (label)
			this.setState({
				filtered: all.filter(a => a.name === label)
			})
		else this.setState({ filtered: all })
	}

	filterLocation = ({ label }) => {
		let all = this.state.providers
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.deliveryLocation === label)
			})
		else this.setState({ filtered: all })
	}

	filterInd = ({ label }) => {
		let all = this.state.providers
		let status = label === 'Non' ? false : true
		if (label !== 'Toute')
			this.setState({
				filtered: all.filter(a => a.individual === status)
			})
		else this.setState({ filtered: all })
	}

	removeProvider = reference =>
		axios
			.delete('/api/provider', { data: { reference } })
			.then(res => {
				const refCmp = cur => cur.reference !== reference
				this.setState(state => ({
					providers: state.providers.filter(refCmp),
					filtered: state.filtered.filter(refCmp)
				}))
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

	componentDidMount() {
		axios
			.get('/api/provider')
			.then(res => {
				this.setState({
					providers: res.data.providers ? res.data.providers : [],
					filtered: res.data.providers ? res.data.providers : []
				})
				this.setLocation()
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	render() {
		const columns = [
			{
				Header: 'Fournisseur',
				accessor: 'name'
			},
			{
				Header: 'Réference',
				accessor: 'reference'
			},
			{
				Header: 'E-mail',
				accessor: 'mail'
			},
			{
				Header: 'Livraison',
				accessor: 'deliveryLocation'
			},
			{
				Header: 'Modifier',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							style={{
								cursor: 'pointer'
							}}
							onClick={() =>
								this.setState({
									provEdit: row._original,
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
							style={{
								cursor: 'pointer'
							}}
							onClick={() =>
								this.removeProvider(row._original.reference)
							}
							className='ion ion-md-trash text-danger'
						/>
					</div>
				)
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.addRedirect && (
					<Redirect to='/achat/AddFournisseur' />
				)}
				{this.state.toLogin && <Redirect to='/' />}
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: `/achat/Editfournisseur`,
							state: { provider: this.state.provEdit }
						}}
					/>
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Fournisseur
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
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Fournisseur</Form.Label>
							<Select
								onChange={this.filterProvider}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									{ label: 'Toute' },
									...new Set(this.state.providers)
								].map(pro => ({ label: pro.name }))}
							/>
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Lieu de livraison</Form.Label>
							<Select
								isSearchable={false}
								onChange={this.filterLocation}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									'Toute',
									...new Set(this.state.location)
								].map(location => ({ label: location }))}
							/>
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Individuel</Form.Label>
							<Select
								onChange={this.filterInd}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									'Toute',
									...new Set(this.state.individualFilter)
								].map(cur => ({ label: cur }))}
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
