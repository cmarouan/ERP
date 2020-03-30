import React, { Component } from 'react'
import { Form, Col, Alert, Row, Button } from 'react-bootstrap'
import Select from 'react-select'
import '../../vendor/libs/react-select/react-select.scss'
import Axios from 'axios'
import { Redirect } from 'react-router'

export default class EditPto extends Component {
	state = {
		arrIndividual: [{ label: 'Oui' }, { label: 'Non' }],
		err: {},
		message: '',
		redirect: false,
		provider: this.props.location.state.provider,
		toLogin: false
	}

	onChange = e => {
		this.setState({
			provider: {
				...this.state.provider,
				[e.target.name]: e.target.value
			}
		})
	}

	editProvider = () => {
		const provider = {
			reference: this.state.provider.reference,
			name: this.state.provider.name,
			phone: this.state.provider.phone,
			individual: this.state.provider.individual === 'Non' ? false : true,
			mail: this.state.provider.mail,
			address: this.state.provider.address,
			address2: this.state.provider.address2,
			deliveryLocation: this.state.provider.deliveryLocation,
			city: this.state.provider.city,
			country: this.state.provider.country,
			postal: this.state.provider.postal
		}
		this.setState({ err: {} })
		Axios.patch('/api/provider', provider)
			.then(res => {
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ redirect: true }), 2000)
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({toLogin : true});
				else {
					if (err.response.data.errors)
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
				{this.state.redirect && <Redirect to='/achat/fournisseur' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>
						Fournisseur
						<div className='text-muted text-tiny mt-1'>
							<small className='font-weight-normal'>
								Créer un Fournisseur
							</small>
						</div>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Fournisseur</Form.Label>
							<Form.Control
								type='text'
								name='name'
								onChange={this.onChange}
								value={this.state.provider.name}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Email</Form.Label>
							<Form.Control
								type='email'
								name='mail'
								onChange={this.onChange}
								value={this.state.provider.mail}
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
								value={this.state.provider.phone}
							/>
							{this.useErrMessage('phone')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Individual</Form.Label>
							<Select
								isSearchable={false}
								className='react-select'
								classNamePrefix='react-select'
								options={this.state.arrIndividual}
								onChange={({ label }) =>
									this.setState({ individual: label })
								}
								defaultValue={{
									label: this.state.provider.individual
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
								value={this.state.provider.address}
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
								value={this.state.provider.address2}
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
								value={this.state.provider.city}
								onChange={this.onChange}
							/>
							{this.useErrMessage('city')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Pays</Form.Label>
							<Form.Control
								type='text'
								name='country'
								value={this.state.provider.country}
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
								value={this.state.provider.deliveryLocation}
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
								value={this.state.provider.postal}
							/>
							{this.useErrMessage('postal')}
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
							Cancel
						</Button>
					</Col>
					<Col md={2}>
						<Button
							variant='primary'
							disabled={this.state.message.length}
							onClick={this.editProvider}
							className='btn-block'>
							Modifier
						</Button>
					</Col>
				</Row>
			</div>
		)
	}
}
