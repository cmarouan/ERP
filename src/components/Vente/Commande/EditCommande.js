import React, { Component } from 'react'
import { Redirect } from 'react-router'
import moment from 'moment'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import Axios from 'axios'
import ReactTable from 'react-table'
import '../../../vendor/libs/react-table/react-table.scss'
import '../../../vendor/libs/react-select/react-select.scss'

class EditCommande extends Component {
	constructor(props) {
		super(props)

		this.state = {
			providers: [],
			client: {},
			nbDays: 0,
			paymentCond: '',
			articles: [],
			selectedArticles: [],
			filteredArticles: [],
			quantity: 1,
			createdCommand: {},
			cmdRef: '',
			remise: 0,
			price: 0,
			notLogged: false,
			data: this.props.location.state.commande,
			clientType: this.props.location.state.commande.client.type || ''
		}

		Axios.get(`/api/article`).then(({ data }) => {
			const articles = data.articles.map(article => ({
				pricePrefU: article.pricePrefU,
				priceDahanU: article.priceDahanU,
				priceInterU: article.priceInterU,
				priceMagasinU: article.priceMagasinU,
				label: article.name,
				tva: article.tva,
				value: article.reference,
				category: article.category,
				sellingPriceU: article.sellingPriceU,
				date: article.addingDate,
				providers: new Set(article.providers.map(p => p.reference))
			}))
			this.setState({
				articles,
				filteredArticles: articles
			})
		})

		this.addArticle = this.addArticle.bind(this)
	}

	addArticleToCommand = article => {
		console.log(this.state.data)
		const object = {
			orderRef: this.state.data.reference,
			articleRef: article.value,
			quantity: this.state.quantity,
			ttc: article.ttc,
			unitaire: article.unitaire,
			tva: article.tva,
			remise: article.remise,
			price: this.state.price
		}
		Axios.put('/api/order/article', object).catch(err =>
			err.response.status === 401
				? this.setState({ notLogged: true })
				: console.log(err.response)
		)
	}

	addArticle() {
		let ht = this.state.price * this.state.quantity
		let remise = ht * (this.state.remise / 100)
		ht = ht - remise
		const article = {
			...this.state.article,
			quantity: this.state.quantity,
			ht: ht,
			tva: ht * (this.state.article.tva / 100),
			unitaire: this.state.price,
			remise: this.state.remise,
			calculedRemise: remise,
			ttc: ht + ht * (this.state.article.tva / 100)
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
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	deleteFromCommande = (id, index) => {
		Axios.delete('/api/order/article', {
			data: {
				reference: this.state.cmdRef,
				id: id,
				index: index
			}
		}).catch(err =>
			err.response.status === 401
				? this.setState({ notLogged: true })
				: console.log(err.response)
		)
	}

	componentDidMount() {
		const data = this.state.data
		this.setState({
			nbDays: data.days,
			client: data.client.name,
			cmdRef: data.reference,
			paymentCond: data.paymentMethod
		})
		Axios.get(`/api/order/${data.reference}`)
			.then(res => this.setState({ selectedArticles: res.data.articles }))
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
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
								row._original.unitaire ||
								0
							)}
						</span>
					</div>
				)
			},
			{
				Header: 'Remise',
				Cell: ({ row }) => {
					let pu = row._original.price || row._original.unitaire || 0
					let qte = row._original.quantity
					let ht = row._original.totalPrice || row._original.ht || 0
					let remise = pu * qte - ht
					return (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span className='ml-auto mr-2'>
								{remise}
							</span>
						</div>
					)
				}
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
							).toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'TVA',
				Cell: ({ row }) => {
					let tvapercent =
						row._original.tva ||
						(row._original.article
							? row._original.article.tva
							: row._original.tva) ||
						0
					let ht = row._original.totalPrice || row._original.ht || 0
					let tva = ht * (tvapercent / 100)
					return (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span className='ml-auto mr-2'>
								{tva.toFixed(2)}
							</span>
						</div>
					)
				}
			},
			{
				Header: 'TTC',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.priceTVA +
								row._original.totalPrice ||
								row._original.ttc ||
								0}
						</span>
					</div>
				)
			},
			{
				Header: 'Supprimer',
				Cell: ({ row, index }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							onClick={() => {
								this.setState({
									selectedArticles: this.state.selectedArticles.filter(
										(cur, j) => index !== j
									)
								})
								this.deleteFromCommande(row._id, index)
							}}
							className='ion ion-md-trash text-danger'
							style={{
								cursor: 'pointer'
							}}
						/>
					</div>
				)
			}
		]

		return (
			<div>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.addRedirect && <Redirect to='/vente/commande' />}
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
							<Form.Label>Client</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.client}
							/>
						</Form.Group>
					</Form.Row>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>délai de décaissement</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.nbDays}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Modalités de paiement</Form.Label>
							<Form.Control
								disabled
								type='text'
								value={this.state.paymentCond}
							/>
						</Form.Group>
					</Form.Row>
				</div>
				<div>
					<div className='ui-bordered px-4 pt-4 mb-4'>
						<Form.Row>
							<Form.Group as={Col} md={4} className='mb-4'>
								<Form.Label>Article</Form.Label>
								<Select
									onChange={article => {
										if (
											this.state.clientType ===
											'Intermédiaire'
										)
											this.setState({
												price: article.priceInterU
											})
										else if (
											this.state.clientType ===
											'Groupe Dahan'
										)
											this.setState({
												price: article.priceDahanU
											})
										else if (
											this.state.clientType === 'Magasin'
										)
											this.setState({
												price: article.priceMagasinU
											})
										else if (
											this.state.clientType === 'Public'
										)
											this.setState({
												price: article.sellingPriceU
											})
										else
											this.setState({
												price: article.pricePrefU
											})

										console.log(
											this.state.clientType,
											article
										)
										this.setState({
											article
										})
									}}
									className='react-select'
									classNamePrefix='react-select'
									options={this.state.filteredArticles}
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
							<Form.Group as={Col} md={2} className='mb-4 mr-2'>
								<Form.Label>Type Prix</Form.Label>
								<Select
									disabled={!this.state.article}
									onChange={obj => {
										this.setState({
											clientType: obj.label,
											price: this.state.article
												? this.state.article[
														obj.value
												  ].toFixed(2)
												: ''
										})
									}}
									className='react-select'
									classNamePrefix='react-select'
									options={[
										{
											label: 'Public',
											value: 'sellingPriceU'
										},
										{
											label: 'Revient',
											value: 'pricePrefU'
										},
										{
											label: 'Groupe Dahan',
											value: 'priceDahanU'
										},
										{
											label: 'Intermédiaire',
											value: 'priceInterU'
										},
										{
											label: 'Magasin',
											value: 'priceMagasinU'
										}
									]}
									value={{ label: this.state.clientType }}
								/>
							</Form.Group>
							<Form.Group as={Col} md={2} className='mb-4 mx-2'>
								<Form.Label>Prix Unitaire</Form.Label>
								<Form.Control
									type='text'
									name='price'
									value={this.state.price}
									onChange={e =>
										this.setState({
											price: e.target.value
										})
									}
								/>
							</Form.Group>
							<Form.Group as={Col} md={2} className='mb-4 mx-2'>
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
							<Form.Group as={Col} md={2} className='mb-4 mx-2'>
								<Form.Label>Remise</Form.Label>
								<Form.Control
									type='text'
									value={this.state.remise}
									name='remise'
									onChange={e =>
										this.setState({
											remise: e.target.value
										})
									}
								/>
							</Form.Group>
							<Form.Group as={Col} md={2} className='mb-4 mx-2'>
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
										!this.state.article
									}
									onClick={this.addArticle}>
									Ajouter
								</Button>
							</Col>
						</Form.Row>
					</div>
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
				<div className='d-flex justify-content-end align-center'>
					<Button
						variant='primary'
						className='mx-2'
						onClick={() => this.setState({ addRedirect: true })}>
						Valider
					</Button>
				</div>
			</div>
		)
	}
}

export default EditCommande
