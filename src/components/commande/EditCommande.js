import React, { Component } from 'react'
import { Redirect } from 'react-router'
import moment from 'moment'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import Axios from 'axios'
import ReactTable from 'react-table'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'

class EditCommande extends Component {
	constructor(props) {
		super(props)

		this.state = {
			providers: [],
			provider: {},
			nbDays: 0,
			paymentCond: '',
			articles: [],
			selectedArticles: [],
			filteredArticles: [],
			quantity: 1,
			createdCommand: {},
			cmdRef: '',
			price: 0,
			remise: 0,
			data: this.props.location.state.commande,
			toLogin: false
		}

		Axios.get(`/api/article`)
			.then(({ data }) => {
				const articles = data.articles.map(article => ({
					label: article.name,
					tva: article.tva,
					value: article.reference,
					category: article.category,
					price: article.buyingPriceU,
					date: article.addingDate,
					providers: new Set(article.providers.map(p => p.reference))
				}))
				this.setState({
					articles,
					filteredArticles: articles
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

		this.addArticle = this.addArticle.bind(this)
	}

	addArticleToCommand = article => {
		const object = {
			orderRef: this.state.cmdRef,
			articleRef: article.value,
			quantity: this.state.quantity,
			price: this.state.price,
			remise: 0
		}
		Axios.put('/api/order/article', object)
			.then(res => {})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	deleteCommande = () => {
		Axios.delete('/api/order', {
			data: {
				reference: this.state.cmdRef
			}
		})
			.then(res => {
				this.setState({ addRedirect: true })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	addArticle() {
		const ht = this.state.price * this.state.quantity
		const article = {
			...this.state.article,
			quantity: this.state.quantity,
			ht: ht,
			price: this.state.price,
			ttc: ht + ht * (this.state.article.tva / 100),
			tva: ht * (this.state.article.tva / 100)
		}
		this.addArticleToCommand(article)
		this.setState({
			selectedArticles: [...this.state.selectedArticles, article],
			quantity: 1
		})
	}

	createCommand = () => {
		const commande = {
			providerRef: this.state.provider,
			days: this.state.nbDays,
			paymentMethod: this.state.paymentCond
		}
		Axios.post('/api/order/buy', commande)
			.then(res =>
				this.setState({
					cmdCreated: true,
					createdCommand: res.data.order || {}
				})
			)
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	deleteFromCommande = (id, index) => {
		Axios.delete('/api/order/article', {
			data: {
				reference: this.state.cmdRef,
				id: id,
				index: index
			}
		}).catch(err => {
			if (err && err.response && err.response.status === 401)
				this.setState({ toLogin: true })
		})
	}

	componentDidMount() {
		const data = this.state.data
		this.setState({
			nbDays: data.days,
			provider: data.provider ? data.provider.name : '',
			cmdRef: data.reference,
			paymentCond: data.paymentMethod
		})
		Axios.get(`/api/order/${data.reference}`)
			.then(res => {
				this.setState({
					selectedArticles: res.data.articles.filter(x => x.article)
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	render() {
		const columns = [
			{
				Header: 'Article',
				Cell: ({ row }) =>
					row._original.article
						? row._original.article.name
						: row._original.label
			},
			{
				Header: 'Catégorie',
				Cell: ({ row }) =>
					row._original.article
						? row._original.article.category
						: row._original.category
			},
			{
				Header: 'Quantité',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.quantity}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Unitaire',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{(
								row._original.price ||
								row._original.article.price ||
								0
							)}
						</span>
					</div>
				)
			},
			{
				Header: 'HT',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{(
								row._original.totalPrice ||
								row._original.ht ||
								0
							)}
						</span>
					</div>
				)
			},
			{
				Header: 'TVA',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{(
								row._original.priceTVA ||
								row._original.tva ||
								0
							)}
						</span>
					</div>
				)
			},
			{
				Header: 'TTC',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{(
								row._original.priceTVA +
									row._original.totalPrice ||
								row._original.ttc ||
								0
							)}
						</span>
					</div>
				)
			},
			{
				Header: 'Supprimer',
				Cell: ({ row, index }) => (
					<span
						onClick={() => {
							this.setState({
								selectedArticles: this.state.selectedArticles.filter(
									(cur, j) => index !== j
								)
							})
							this.deleteFromCommande(row._original._id, index)
						}}
						className='ion ion-md-trash text-danger px-4'
						style={{
							cursor: 'pointer'
						}}
					/>
				)
			}
		]

		return (
			<div>
				{this.state.addRedirect && <Redirect to='/achat/commande' />}
				{this.state.toLogin && <Redirect to='/' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 pl-2 mb-4'>
					Modifier une commande
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Commande référence</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.cmdRef}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Fournisseur</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.provider}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Modalités de paiement</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.nbDays}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Condition de paiment</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.paymentCond}
							/>
						</Form.Group>
					</Form.Row>
				</div>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Article</Form.Label>
							<Select
								isSearchable={false}
								onChange={article =>
									this.setState({
										article,
										price: article.price
									})
								}
								className='react-select'
								classNamePrefix='react-select'
								options={this.state.filteredArticles}
								defaultValue={this.state.filteredArticles[0]}
							/>
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Catégorie</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.article
										? this.state.article.category
										: ''
								}
							/>
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4'>
							<Form.Label>Date</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.article
										? moment(
												this.state.article.date
										  ).format('DD/MM/YYYY')
										: ''
								}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={3} className='mb-4 mr-4'>
							<Form.Label>Prix Unitaire</Form.Label>
							<Form.Control
								name='price'
								type='number'
								value={this.state.price}
								onChange={e =>
									this.setState({ price: e.target.value })
								}
							/>
						</Form.Group>
						<Form.Group as={Col} md={4} className='mb-4 mr-4'>
							<Form.Label>Taxe</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={
									this.state.article
										? this.state.article.tva
										: ''
								}
							/>
						</Form.Group>
						<Form.Group as={Col} md={3} className='mb-4 mr-4'>
							<Form.Label>Quantité</Form.Label>
							<Form.Control
								type='number'
								onChange={e =>
									this.setState({
										quantity: +e.target.value
									})
								}
								value={this.state.quantity}
							/>
						</Form.Group>
						<Col
							md={1}
							className='d-flex justify-content-center align-items-center ml-auto'>
							<Button
								variant='primary'
								disabled={
									!this.state.quantity ||
									!this.state.article ||
									!+this.state.price
								}
								onClick={this.addArticle}>
								Ajouter
							</Button>
						</Col>
					</Form.Row>
					<br />
				</div>
				<div className='card-datatable table-responsive'>
					<ReactTable
						className='-striped -highlight'
						data={this.state.selectedArticles}
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
				<br />
				<div className='d-flex justify-content-end align-center'>
					<Button
						variant='primary'
						className='mx-2'
						onClick={() => this.setState({ addRedirect: true })}>
						Valider
					</Button>
					<Button
						variant='danger'
						className='mx-2'
						onClick={this.deleteCommande}>
						Annuler
					</Button>
				</div>
			</div>
		)
	}
}

export default EditCommande
