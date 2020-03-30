import React, { Component } from 'react'
import axios from 'axios'
import { Form, Button, Col, Row } from 'react-bootstrap'
import Select from 'react-select'
import { Redirect } from 'react-router'
import '../../vendor/libs/react-select/react-select.scss'

const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export default class AddArticle extends Component {
	constructor(props) {
		super(props)
		axios.get('/api/provider').then(({ data }) => {
			if (data.providers)
				this.setState({
					providers: data.providers.map(({ name }) => ({
						label: name
					}))
				})
		})
	}

	state = {
		providerName: '',
		name: '',
		tva: '',
		pricePrefU: '',
		priceDahanU: '',
		priceInterU: '',
		priceMagasinU: '',
		sellingPriceU: '',
		buyingPriceU: '',
		category: '',
		err: {},
		redirect: false,
		status: undefined,
		message: 'Error',
		toLogin: false
	}

	tvas = [
		{ label: '20' },
		{ label: '14' },
		{ label: '10' },
		{ label: '7' },
		{ label: '0' }
	]

	fileInput = React.createRef()

	ft_addArticle = e => {
		this.setState({ err: {} })
		const fd = new FormData()
		const keys = [
			'pricePrefU',
			'priceMagasinU',
			'priceInterU',
			'priceDahanU',
			'sellingPriceU',
			'buyingPriceU',
			'providerName',
			'category',
			'image',
			'name',
			'tva'
		]
		keys.forEach(key => fd.append(key, this.state[key]))
		axios
			.post('/api/article', fd)
			.then(res => {
				this.setState({ status: true })
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ willRedirect: true }), 2000)
			}).catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({toLogin : true});
				else {
					this.setState({ err: err.response.data.errors })
				}
			})
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

	render() {
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.willRedirect && <Redirect to='/achat/article' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='w-100 font-weight-bold py-3 mb-4'>
					Article
					<span className='d-block font-weight-normal text-muted text-tiny mt-1'>
						Créer un article
					</span>
				</h4>
				<div className='ui-bordered p-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6}>
							<Form.Label>Nom d'article</Form.Label>
							<Form.Control
								type='text'
								name='name'
								value={this.state.name}
								onChange={this.onChange}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6}>
							<Form.Label>Catégorie</Form.Label>
							<Form.Control
								type='text'
								name='category'
								onChange={this.onChange}
								value={this.state.category}
							/>
							{this.useErrMessage('category')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={4}>
							<Form.Label>Prix d'achat</Form.Label>
							<Form.Control
								type='number'
								name='buyingPriceU'
								onChange={this.onChange}
								value={this.state.buyingPriceU}
							/>
							{this.useErrMessage('buyingPriceU')}
						</Form.Group>
						<Form.Group as={Col} md={4}>
							<Form.Label>Prix Public</Form.Label>
							<Form.Control
								type='number'
								name='sellingPriceU'
								onChange={this.onChange}
								value={this.state.sellingPriceU}
							/>
							{this.useErrMessage('sellingPriceU')}
						</Form.Group>
						<Form.Group as={Col} md={4}>
							<Form.Label>TVA (%)</Form.Label>
							<Select
								isSearchable={false}
								className='react-select'
								classNamePrefix='react-select'
								options={this.tvas}
								defaultValue={this.state.tva}
								onChange={({ label }) =>
									this.setState({ tva: +label })
								}
							/>
							{this.useErrMessage('tva')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={3}>
							<Form.Label>Prix de revient</Form.Label>
							<Form.Control
								type='number'
								name='pricePrefU'
								value={this.state.pricePrefU}
								onChange={this.onChange}
							/>
							{this.useErrMessage('pricePrefU')}
						</Form.Group>
						<Form.Group as={Col} md={3}>
							<Form.Label>Prix Dahan</Form.Label>
							<Form.Control
								type='number'
								name='priceDahanU'
								onChange={this.onChange}
								value={this.state.priceDahanU}
							/>
							{this.useErrMessage('priceDahanU')}
						</Form.Group>
						<Form.Group as={Col} md={3}>
							<Form.Label>Prix Intermédiaire</Form.Label>
							<Form.Control
								type='number'
								name='priceInterU'
								value={this.state.priceInterU}
								onChange={this.onChange}
							/>
							{this.useErrMessage('priceInterU')}
						</Form.Group>
						<Form.Group as={Col} md={3}>
							<Form.Label>Prix Magasin</Form.Label>
							<Form.Control
								type='number'
								name='priceMagasinU'
								onChange={this.onChange}
								value={this.state.priceMagasinU}
							/>
							{this.useErrMessage('priceMagasinU')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6}>
							<Form.Label>Image</Form.Label>
							<Form.Control
								type='text'
								name='image'
								onChange={() => {}}
								onClick={() => this.fileInput.current.click()}
								value={
									this.state.image
										? `${
												this.state.image.name
										  } (${formatBytes(
												this.state.image.size
										  )})`
										: ''
								}
							/>
							{this.useErrMessage('image')}
							<input
								type='file'
								ref={this.fileInput}
								style={{ display: 'none' }}
								onChange={e =>
									this.setState({
										image: e.target.files[0]
									})
								}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6}>
							<Form.Label>Fournisseur</Form.Label>
							<Select
								isSearchable={false}
								className='react-select'
								classNamePrefix='react-select'
								options={this.state.providers}
								defaultValue={this.state.providers}
								onChange={({ label }) =>
									this.setState({
										providerName: label
									})
								}
							/>
							{this.useErrMessage('providerName')}
						</Form.Group>
					</Form.Row>
				</div>
				<Row>
					<Col md={7}>
						{this.state.status && (
							<div className='alert alert-success' role='alert'>
								{this.state.message}
							</div>
						)}
					</Col>
					<Col md={1} />
					<Col md={2}>
						<Button
							variant='danger'
							className='btn-block'
							disabled={this.state.status}
							onClick={() =>
								this.setState({ willRedirect: true })
							}>
							Annuler
						</Button>
					</Col>
					<Col md={2}>
						<Button
							variant='primary'
							className='btn-block'
							disabled={this.state.status}
							onClick={this.ft_addArticle}>
							Valider
						</Button>
					</Col>
				</Row>
			</div>
		)
	}
}
