import axios from 'axios'
import moment from 'moment'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Col, Button } from 'react-bootstrap'

export default class AddReglement extends Component {
	state = {
		facture: this.props.location.state.commande,
		payments: this.props.location.state.commande.payments,
		description: '',
		payment: '',
		type: '',
		err: {},
		toLogin: false
	}

	onChange = e => this.setState({ [e.target.name]: e.target.value })

	pay = () => {
		this.setState({ err: {} })
		const { payment, type, description } = this.state
		axios
			.post('/api/facture/payment', {
				factureRef: this.state.facture.reference,
				type: type,
				payment: payment,
				description: description
			})
			.then(res =>
				this.setState({
					type: '',
					payment: '',
					description: '',
					payments: [...this.state.payments, res.data]
				})
			)
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
				else this.setState({ err: err.response.data.errors })
			})
	}

	removeReglement = reference =>
		axios
			.delete('/api/facture/payment', {
				data: { factureRef: this.state.facture.reference, reference }
			})
			.then(res =>
				this.setState(state => ({
					payments: state.payments.filter(
						cur => cur.reference !== reference
					)
				}))
			)
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

	useErrMessage = key =>
		this.state.err[key] && (
			<Form.Label
				className='pl-2'
				style={{ color: 'red', fontSize: '.8em' }}>
				{this.state.err[key]}
			</Form.Label>
		)

	render() {
		console.log(this.state.facture)
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.redirect && <Redirect to='/achat/fournisseur' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>
						Réglement
						<div className='text-muted text-tiny mt-1'>
							<small className='font-weight-normal'>
								Régler une facture
							</small>
						</div>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Réference</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.facture.reference}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>
								{this.state.facture.type > 0
									? 'Fournisseur'
									: 'Client'}
							</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.facture.order
										? this.state.facture.type > 0
											? this.state.facture.order.provider
													.name
											: this.state.facture.order.client
													.name
										: ''
								}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Commerciale</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.facture.commercial}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Date de facturation</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.facture.order
										? moment(
												this.state.facture.order.date
										  ).format('DD/MM/YYYY')
										: ''
								}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Condition de paiement</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.facture.order
										? this.state.facture.order.paymentMethod
										: ''
								}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Nombre de jours</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.facture.order
										? this.state.facture.order.days
										: ''
								}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group
							as={Col}
							md={this.state.facture.type > 0 ? 6 : 4}
							className='mb-4'>
							<Form.Label>Montant de la facture</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.facture.total}
							/>
						</Form.Group>
						<Form.Group
							as={Col}
							md={this.state.facture.type > 0 ? 6 : 4}
							className='mb-4'>
							<Form.Label>
								Les jours restant à l'échéance
							</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.facture.order
										? moment(this.state.facture.order.date)
												.add(
													this.state.facture.order
														.days,
													'days'
												)
												.diff(moment(), 'days')
										: ''
								}
							/>
						</Form.Group>
						{this.state.facture.type < 0 && (
							<Form.Group as={Col} md={4} className='mb-4'>
								<Form.Label>Plafond delai</Form.Label>
								<Form.Control
									disabled
									type='text'
									value={
										this.state.facture.order
											? this.state.facture.order.client
													.maximumCredit
											: ''
									}
								/>
							</Form.Group>
						)}
					</Form.Row>
				</div>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={3} className='mb-4'>
							<Form.Label>Type de réglement</Form.Label>
							<Form.Control
								type='text'
								onChange={this.onChange}
								value={this.state.type}
								name='type'
							/>
							{this.useErrMessage('type')}
						</Form.Group>
						<Form.Group as={Col} md={3} className='mb-4'>
							<Form.Label>Référence de réglement</Form.Label>
							<Form.Control
								type='text'
								name='description'
								value={this.state.description}
								onChange={this.onChange}
							/>
							{this.useErrMessage('description')}
						</Form.Group>
						<Form.Group as={Col} md={3} className='mb-4'>
							<Form.Label>Montant de réglement</Form.Label>
							<Form.Control
								type='text'
								name='payment'
								value={this.state.payment}
								onChange={this.onChange}
							/>
							{this.useErrMessage('payment')}
						</Form.Group>
						<Col md={3} className='mb-4'>
							<Form.Label></Form.Label>
							<Button
								variant='primary'
								className='btn-block mt-1'
								onClick={this.pay}>
								Ajouter
							</Button>
						</Col>
					</Form.Row>
				</div>
				<div className='card-datatable table-responsive'>
					<table
						id='article-list'
						className='table table-striped table-bordered'>
						<thead>
							<tr>
								<th>N° de facture</th>
								<th>Type de réglement</th>
								<th>Référence de réglement</th>
								<th>Date de réglement</th>
								<th>Montant de réglement</th>
								<th>Supprimer</th>
							</tr>
						</thead>
						<tbody>
							{this.state.payments &&
								this.state.payments.length > 0 &&
								this.state.payments.map((row, index) => (
									<tr key={index}>
										<td>{this.state.facture.reference}</td>
										<td>{row.type}</td>
										<td>{row.description}</td>
										<td>
											{moment(row.date).format(
												'DD/MM/YYYY'
											)}
										</td>
										<td>{row.payment.toFixed(2)}</td>
										<td style={{ textAlign: 'center' }}>
											<span
												onClick={() =>
													this.removeReglement(
														row.reference
													)
												}
												className='ion ion-md-trash text-danger'
												style={{
													cursor: 'pointer'
												}}
											/>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		)
	}
}
