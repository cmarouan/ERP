import React, { Component } from 'react'
import { Form, Col, Alert, Button } from 'react-bootstrap'
import axios from 'axios'
import { Redirect } from 'react-router'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'
import '../../vendor/libs/react-select/react-select.scss'

export default class AddNote extends Component {
	state = {
		reference: '',
		date: new Date(),
		field: '',
		description: '',
		refundable: '',
		type: '',
		totalHT: '',
		tva: '',
		total: '',
		redirect: false,
		toLogin: false,
		message: '',
		err: {}
	}

	isRefundable = [
		{
			label: 'Oui'
		},
		{
			label: 'Non'
		}
	]

	paymentConditions = [
		{ label: 'BC' },
		{ label: 'CHQ' },
		{ label: 'LCN' },
		{ label: 'Immédiat' },
		{ label: 'Virement' }
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

	addExpense = () => {
		this.setState({ message: '' })
		const exp = {
			reference: this.state.reference,
			date: this.state.date,
			field: this.state.field,
			description: this.state.description,
			refundable: this.state.refundable,
			type: this.state.type,
			totalHT: this.state.totalHT,
			tva: this.state.tva,
			total: this.state.total
		}
		this.setState({ err: {} })
		axios
			.post('/api/expense', exp)
			.then(res => {
				this.setState({ message: 'La note est créer' })
				setTimeout(() => this.setState({ redirect: true }), 2000)
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
				else {
					if (err.response) {
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
					} else {
						console.log(err)
					}
				}
			})
	}

	render() {
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.redirect && <Redirect to='/note de frais/note' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Créer une Note
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Réference</Form.Label>
							<Form.Control
								type='text'
								name='reference'
								onChange={this.onChange}
								value={this.state.reference}
							/>
							{this.useErrMessage('reference')}
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Date</Form.Label>
							<DatePicker
								className='form-control'
								selected={this.state.date}
								onChange={value =>
									this.setState({ date: value })
								}
							/>
							{this.useErrMessage('date')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={12} className='mb-4'>
							<Form.Label>Dépense</Form.Label>
							<Form.Control
								type='text'
								name='field'
								onChange={this.onChange}
								value={this.state.field}
							/>
							{this.useErrMessage('field')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Libellé</Form.Label>
							<Form.Control
								type='text'
								name='description'
								onChange={this.onChange}
								value={this.state.description}
							/>
							{this.useErrMessage('description')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Remboursable</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								options={this.isRefundable}
								onChange={({ label }) =>
									this.setState({
										refundable: label === 'Oui'
									})
								}
							/>
							{this.useErrMessage('refundable')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Type de paiment</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								options={this.paymentConditions}
								onChange={({ label }) =>
									this.setState({
										type: label
									})
								}
							/>
							{this.useErrMessage('type')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>HT</Form.Label>
							<Form.Control
								type='number'
								name='totalHT'
								value={this.state.totalHT}
								onChange={e =>
									this.setState({
										totalHT: +e.target.value,
										total:
											+e.target.value *
											(this.state.tva / 100 + 1)
									})
								}
							/>
							{this.useErrMessage('totalHT')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>TVA %</Form.Label>
							<Form.Control
								type='number'
								name='tva'
								value={this.state.tva}
								onChange={e =>
									this.setState({
										tva: +e.target.value,
										total:
											this.state.totalHT *
											(+e.target.value / 100 + 1)
									})
								}
							/>
							{this.useErrMessage('tva')}
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>TTC</Form.Label>
							<Form.Control
								disabled
								type='text'
								name='total'
								value={
									this.state.total
										? this.state.total.toFixed(2)
										: ''
								}
							/>
							{this.useErrMessage('total')}
						</Form.Group>
					</Form.Row>
				</div>
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
					<div className='col-md-1'></div>
					<div className='col-md-2'>
						<Button
							variant='danger'
							onClick={() =>
								this.setState({
									redirect: true
								})
							}
							className='btn-block'>
							Annuler
						</Button>
					</div>
					<div className='col-md-2'>
						<Button
							variant='primary'
							onClick={this.addExpense}
							disabled={this.state.message.length}
							className='btn-block'>
							Ajouter
						</Button>
					</div>
				</div>
			</div>
		)
	}
}
