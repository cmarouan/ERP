import React, { Component } from 'react'
import { Form, Col, Alert } from 'react-bootstrap'
import Axios from 'axios'
import { Redirect } from 'react-router'

export default class AddProvider extends Component {
	state = {
		name: '',
		phone: '',
		individual: '',
		arrIndividual: [{ label: 'Oui' }, { label: 'Non' }],
		mail: '',
		address: '',
		address2: '',
		deliveryLocation: '',
		city: '',
		country: '',
		postal: '',
		err: {},
		message: '',
		redirect: false,
		toLogin: false
	}

	onChange = e => this.setState({ [e.target.name]: e.target.value })

	useErrMessage = key =>
		this.state.err[key] && (
			<Form.Label
				className='pl-2'
				style={{ color: 'red', fontSize: '.8em' }}>
				{this.state.err[key]}
			</Form.Label>
		)

	addProvider = () => {
		this.setState({ message: '' })
		const provider = {
			name: this.state.name,
			phone: this.state.phone,
			mail: this.state.mail,
			address: this.state.address,
			address2: this.state.address2,
			deliveryLocation: this.state.deliveryLocation,
			city: this.state.city,
			country: this.state.country,
			postal: this.state.postal
		}
		this.setState({ err: {} })
		Axios.post('/api/provider', provider)
			.then(res => {
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ redirect: true }), 2000)
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
				else {
					if (err.response.data.error) {
						this.setState({
							err: {
								flash: err.response.data.error
							}
						})
					} else if (err.response.data.errors) {
						this.setState({
							err: err.response.data.errors
						})
					}
				}
			})
	}

	render() {
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.redirect && <Redirect to='/achat/fournisseur' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Créer un Fournisseur
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Fournisseur</Form.Label>
							<Form.Control
								type='text'
								name='name'
								onChange={this.onChange}
								value={this.state.name}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='mail'
								onChange={this.onChange}
								value={this.state.mail}
							/>
							{this.useErrMessage('mail')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Téléphone</Form.Label>
							<Form.Control
								type='text'
								name='phone'
								onChange={this.onChange}
								value={this.state.phone}
							/>
							{this.useErrMessage('phone')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Code postal</Form.Label>
							<Form.Control
								type='text'
								name='postal'
								onChange={this.onChange}
								value={this.state.postal}
							/>
							{this.useErrMessage('postal')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Adresse</Form.Label>
							<Form.Control
								type='text'
								name='address'
								value={this.state.address}
								onChange={this.onChange}
							/>
							{this.useErrMessage('address')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Adresse 2</Form.Label>
							<Form.Control
								type='text'
								name='address2'
								onChange={this.onChange}
								value={this.state.address2}
							/>
							{this.useErrMessage('address2')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Ville</Form.Label>
							<Form.Control
								type='text'
								name='city'
								value={this.state.city}
								onChange={this.onChange}
							/>
							{this.useErrMessage('city')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Pays</Form.Label>
							<Form.Control
								type='text'
								name='country'
								value={this.state.country}
								onChange={this.onChange}
							/>
							{this.useErrMessage('country')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={12} className='mb-4'>
							<Form.Label>Adresse de dépot</Form.Label>
							<Form.Control
								type='text'
								name='deliveryLocation'
								value={this.state.deliveryLocation}
								onChange={this.onChange}
							/>
							{this.useErrMessage('deliveryLocation')}
						</Form.Group>
					</Form.Row>
				</div>
				<br />
				<div className='row'>
					<div className='col-md-7'>
						{this.state.message.length > 0 && (
							<Alert variant='success'>
								{this.state.message}
							</Alert>
						)}
						{this.state.err.flash && (
							<Alert variant='danger'>
								{this.state.err.flash}
							</Alert>
						)}
					</div>
					<div className='col-md-2'></div>
					<div className='col-md-3'>
						<button
							disabled={this.state.message.length}
							type='button'
							onClick={this.addProvider}
							className='btn btn-primary btn-block'>
							Ajouter
						</button>
					</div>
				</div>
			</div>
		)
	}
}
