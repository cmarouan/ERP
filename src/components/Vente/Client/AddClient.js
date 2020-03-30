import Axios from 'axios'
import Select from 'react-select'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Col, Row, Alert, Button } from 'react-bootstrap'
import '../../../vendor/libs/react-select/react-select.scss'

export default class AddClient extends Component {
	state = {
		ice: '',
		name: '',
		type: '',
		phone: '',
		individual: '',
		mail: '',
		address: '',
		address2: '',
		deliveryLocation: '',
		city: '',
		country: '',
		postal: '',
		err: {},
		nbDays: 0,
		plafond: '',
		message: '',
		redirect: false,
		notLogged: false
	}

	arrIndividual = [{ label: 'Societé' }, { label: 'Particulier' }]

	arrPayment = [
		{ label: 'BC' },
		{ label: 'CHQ' },
		{ label: 'LCN' },
		{ label: 'Immédiat' },
		{ label: 'Virement' }
	]

	clientTypes = [
		{ label: 'Intermédiaire' },
		{ label: 'Groupe Dahan' },
		{ label: 'Magasin' },
		{ label: 'Public' },
		{ label: 'Revient' }
	]

	onChange = e => this.setState({ [e.target.name]: e.target.value })

	useErrMessage = key =>
		this.state.err[key] && (
			<Form.Label
				className='pl-2'
				style={{ color: 'red', fontSize: '.8em' }}>
				{this.state.err[key]}
			</Form.Label>
		)

	addClient = () => {
		this.setState({ message: '', err: {} })
		const client = {
			ice: this.state.ice,
			type: this.state.type,
			name: this.state.name,
			phone: this.state.phone,
			mail: this.state.mail,
			address: this.state.address,
			address2: this.state.address2,
			deliveryLocation: 'X',
			city: this.state.city,
			country: this.state.country,
			postal: this.state.postal,
			paymentMethod: this.state.payment,
			paymentDays: this.state.nbDays,
			maximumCredit: this.state.plafond
		}
		Axios.post('/api/client', client)
			.then(res => {
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ redirect: true }), 2000)
			})
			.catch(err => {
				console.log(err.response);
				if (err.response && err.response.status === 401) {
					this.setState({ notLogged: true })
				} else if (err.response.data.error) {
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
			})
	}

	render() {
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.redirect && <Redirect to='/vente/client' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>
						Client
						<div className='text-muted text-tiny mt-1'>
							<small className='font-weight-normal'>
								Créer un Client
							</small>
						</div>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Nom</Form.Label>
							<Form.Control
								type='text'
								name='name'
								onChange={this.onChange}
								value={this.state.name}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='mail'
								onChange={this.onChange}
								value={this.state.mail}
							/>
							{this.useErrMessage('mail')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Téléphone</Form.Label>
							<Form.Control
								type='text'
								name='phone'
								onChange={this.onChange}
								value={this.state.phone}
							/>
							{this.useErrMessage('phone')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Client</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								options={this.clientTypes}
								onChange={({ label }) =>
									this.setState({ type: label })
								}
							/>
							{this.useErrMessage('')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Plafond des crédits</Form.Label>
							<Form.Control
								type='text'
								name='plafond'
								value={this.state.plafond}
								onChange={this.onChange}
							/>
							{this.useErrMessage('plafond')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>ICE</Form.Label>
							<Form.Control
								type='text'
								name='ice'
								onChange={this.onChange}
								value={this.state.ice}
							/>
							{this.useErrMessage('ice')}
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
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Ville</Form.Label>
							<Form.Control
								type='text'
								name='city'
								value={this.state.city}
								onChange={this.onChange}
							/>
							{this.useErrMessage('city')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Pays</Form.Label>
							<Form.Control
								type='text'
								name='country'
								value={this.state.country}
								onChange={this.onChange}
							/>
							{this.useErrMessage('country')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
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
							<Form.Label>Modalités de paiement</Form.Label>
							<Select
								onChange={({ label }) =>
									this.setState({
										payment: label
									})
								}
								className='react-select'
								classNamePrefix='react-select'
								options={this.arrPayment}
								defaultValue={{ label: this.state.payment }}
							/>
							{this.useErrMessage('payment')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Délai de décaissement</Form.Label>
							<Form.Control
								type='number'
								name='nbDays'
								value={this.state.nbDays}
								onChange={this.onChange}
							/>
							{this.useErrMessage('nbDays')}
						</Form.Group>
					</Form.Row>
				</div>
				<Row>
					<Col md={7}>
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
					</Col>
					<Col md={1} />
					<Col md={2}>
						<Button
							variant='danger'
							className='btn-block'
							disabled={this.state.status}
							onClick={() =>
								this.setState({
									redirect: true
								})
							}>
							Annuler
						</Button>
					</Col>
					<Col md={2}>
						<Button
							variant='primary'
							className='btn-block'
							disabled={this.state.message.length}
							onClick={this.addClient}>
							Ajouter
						</Button>
					</Col>
				</Row>
			</div>
		)
	}
}
