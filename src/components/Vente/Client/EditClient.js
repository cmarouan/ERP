import Axios from 'axios'
import Select from 'react-select'
import { Redirect } from 'react-router'
import React, { Component } from 'react'
import { Form, Col, Alert, Row, Button } from 'react-bootstrap'
import '../../../vendor/libs/react-select/react-select.scss'

export default class EditClient extends Component {
	state = {
		err: {},
		message: '',
		redirect: false,
		notLogged: false,
		client: this.props.location.state.client
	}

	arrIndividual = [{ label: 'Oui' }, { label: 'Non' }]

	arrPayment = [
		{ label: 'BC' },
		{ label: 'CHQ' },
		{ label: 'LCN' },
		{ label: 'Immédiat' }
	]

	days = [
		{ label: 0 },
		{ label: 15 },
		{ label: 20 },
		{ label: 30 },
		{ label: 35 },
		{ label: 40 },
		{ label: 45 },
		{ label: 60 }
	]

	onChange = e => {
		this.setState({
			client: {
				...this.state.client,
				[e.target.name]: e.target.value
			}
		})
	}

	editClient = () => {
		const client = {
			...this.state.client,
			individual: this.state.client.individual === 'Non' ? false : true
		}
		this.setState({ err: {} })
		Axios.patch('/api/client', client)
			.then(res => {
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ redirect: true }), 2000)
			})
			.catch(err => {
				console.log(err.response)
				if (err.response && err.response.status === 401) {
					this.setState({ notLogged: true })
				} else if (err.response.data.errors) {
					this.setState({
						err: err.response.data.errors
					})
				}
			})
	}

	useErrMessage = key =>
		this.state.err[key] && (
			<Form.Label
				className='pl-2'
				style={{ color: 'red', fontSize: '.8em' }}>
				{this.state.err[key]}
			</Form.Label>
		)

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
								Modifier un Client
							</small>
						</div>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Client</Form.Label>
							<Form.Control
								type='text'
								name='name'
								onChange={this.onChange}
								value={this.state.client.name}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='mail'
								onChange={this.onChange}
								value={this.state.client.mail}
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
								value={this.state.client.phone}
							/>
							{this.useErrMessage('phone')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Individual</Form.Label>
							<Select
								isSearchable={false}
								className='react-select'
								classNamePrefix='react-select'
								options={this.arrIndividual}
								onChange={({ label }) =>
									this.setState({ individual: label })
								}
								defaultValue={{
									label: this.state.client.individual
										? 'Oui'
										: 'Non'
								}}
							/>
							{this.useErrMessage('individual')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Adresse</Form.Label>
							<Form.Control
								type='text'
								name='address'
								value={this.state.client.address}
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
								value={this.state.client.address2}
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
								value={this.state.client.city}
								onChange={this.onChange}
							/>
							{this.useErrMessage('city')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Pays</Form.Label>
							<Form.Control
								type='text'
								name='country'
								value={this.state.client.country}
								onChange={this.onChange}
							/>
							{this.useErrMessage('country')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Localisation de livraison</Form.Label>
							<Form.Control
								type='text'
								name='deliveryLocation'
								value={this.state.client.deliveryLocation}
								onChange={this.onChange}
							/>
							{this.useErrMessage('deliveryLocation')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Code postal</Form.Label>
							<Form.Control
								type='text'
								name='postal'
								onChange={this.onChange}
								value={this.state.client.postal}
							/>
							{this.useErrMessage('postal')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Condition de paiement</Form.Label>
							<Select
								isSearchable={false}
								onChange={({ label }) =>
									this.setState({
										paymentMethod: label
									})
								}
								className='react-select'
								classNamePrefix='react-select'
								options={this.arrPayment}
								defaultValue={{
									label: this.state.client.paymentMethod
								}}
							/>
							{this.useErrMessage('paymentMethod')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Délai de décaissement</Form.Label>
							<Select
								isSearchable={false}
								onChange={({ label }) =>
									this.setState({
										paymentDays: label
									})
								}
								className='react-select'
								classNamePrefix='react-select'
								options={this.days}
								defaultValue={{
									label: this.state.client.paymentDays
								}}
							/>
							{this.useErrMessage('paymentDays')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>ICE</Form.Label>
							<Form.Control
								type='text'
								name='ice'
								onChange={this.onChange}
								value={this.state.client.ice || 0}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Plafond des crédits</Form.Label>
							<Form.Control
								type='text'
								name='maximumCredit'
								onChange={this.onChange}
								value={this.state.client.maximumCredit}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
					</Form.Row>
				</div>
				<Row>
					<Col md={5}>
						{this.state.message.length > 0 && (
							<Alert variant='success'>
								{this.state.message}
							</Alert>
						)}
					</Col>
					<Col md={3} />
					<Col md={2}>
						<Button
							variant='danger'
							disabled={this.state.message.length}
							onClick={() => this.setState({ redirect: true })}
							className='btn-block'>
							Annuler
						</Button>
					</Col>
					<Col md={2}>
						<Button
							variant='primary'
							disabled={this.state.message.length}
							onClick={this.editClient}
							className='btn-block'>
							Modifier
						</Button>
					</Col>
				</Row>
			</div>
		)
	}
}
