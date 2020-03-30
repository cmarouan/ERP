import axios from 'axios'
import Select from 'react-select'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Button, Col, Row } from 'react-bootstrap'
import '../../vendor/libs/react-select/react-select.scss'

export default class EditArticle extends Component {
	// constructor(props) {
	// 	super(props)
	// 	axios.get('/api/provider').then(({ data }) =>
	// 		this.setState({
	// 			providers: data.providers.map(({ name }) => ({
	// 				label: name
	// 			}))
	// 		})
	// 	)
	// }

	state = {
		err: {},
		article: this.props.location.state.article,
		toLogin: false
	}

	tvas = [
		{ label: '1' },
		{ label: '5' },
		{ label: '10' },
		{ label: '20' },
		{ label: '25' },
		{ label: '30' }
	]

	editArticle = () => {
		this.setState({ err: {} })
		axios
			.patch('/api/article', this.state.article)
			.then(res => {
				console.log('res ---> ', res, this.state.article)
				this.setState({ message: res.data.message })
				setTimeout(() => this.setState({ willRedirect: true }), 2000)
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

	onChange = e => {
		this.setState({
			article: {
				...this.state.article,
				[e.target.name]: e.target.value
			}
		})
	}

	render() {
		console.log('Article =--------->', this.state.article)
		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.willRedirect && <Redirect to='/achat/article' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='w-100 font-weight-bold py-3 mb-4'>
					Article
					<span className='d-block font-weight-normal text-muted text-tiny mt-1'>
						Editer un article
					</span>
				</h4>
				<div className='ui-bordered p-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6}>
							<Form.Label>Nom d'article</Form.Label>
							<Form.Control
								type='text'
								name='name'
								value={this.state.article.name}
								onChange={this.onChange}
							/>
							{this.useErrMessage('name')}
						</Form.Group>
						<Form.Group as={Col} md={6}>
							<Form.Label>Categorie</Form.Label>
							<Form.Control
								type='text'
								name='category'
								onChange={this.onChange}
								value={this.state.article.category}
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
								value={this.state.article.buyingPriceU}
							/>
							{this.useErrMessage('buyingPriceU')}
						</Form.Group>
						<Form.Group as={Col} md={4}>
							<Form.Label>Prix Public</Form.Label>
							<Form.Control
								type='number'
								name='sellingPriceU'
								onChange={this.onChange}
								value={this.state.article.sellingPriceU}
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
								defaultValue={{ label: this.state.article.tva }}
								onChange={({ label }) =>
									this.setState({
										article: {
											...this.state.article,
											tva: +label
										}
									})
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
								value={this.state.article.pricePrefU}
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
								value={this.state.article.priceDahanU}
							/>
							{this.useErrMessage('priceDahanU')}
						</Form.Group>
						<Form.Group as={Col} md={3}>
							<Form.Label>Prix Intermédiaire</Form.Label>
							<Form.Control
								type='number'
								name='priceInterU'
								value={this.state.article.priceInterU}
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
								value={this.state.article.priceMagasinU}
							/>
							{this.useErrMessage('priceMagasinU')}
						</Form.Group>
					</Form.Row>
					<Form.Row>
						{/* <Form.Group as={Col} md={6}>
							<Form.Label>Image</Form.Label>
							<Form.Control
								type='text'
								name='image'
								onClick={() => this.fileInput.current.click()}
								onChange={() => {}}
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
						</Form.Group> */}
						<Form.Group as={Col} md={12}>
							<Form.Label>Fournisseur</Form.Label>
							<Form.Control
								disabled
								type='text'
								name='sellingPriceU'
								value={this.state.article.providers[0].name}
							/>
							{/* <Select
								disabled
								isSearchable={false}
								className='react-select'
								classNamePrefix='react-select'
								options={this.state.providers}
								defaultValue={{
									label: this.state.article.providers[0].name
								}}
								onChange={({ label }) =>
									this.setState({
										providerName: label
									})
								}
							/> */}
							{this.useErrMessage('providerName')}
						</Form.Group>
					</Form.Row>
				</div>
				<Row>
					<Col md={7}>
						{this.state.message && (
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
							onClick={this.editArticle}>
							Valider
						</Button>
					</Col>
				</Row>
			</div>
		)
	}
}
