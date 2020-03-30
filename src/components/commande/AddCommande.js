import React, { Component } from 'react'
import { Redirect } from 'react-router'
import moment from 'moment'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import Axios from 'axios'
import ReactTable from 'react-table'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'

class CreateCommande extends Component {
	constructor(props) {
		super(props)

		this.state = {
			providers: [],
			provider: '',
			paymentConditions: [
				{ label: 'BC' },
				{ label: 'CHQ' },
				{ label: 'LCN' },
				{ label: 'Immédiat' },
				{ label: 'Virement' }
			],
			nbDays: 0,
			paymentCond: '',
			articles: [],
			selectedArticles: [],
			filteredArticles: [],
			quantity: '',
			cmdCreated: false,
			createdCommand: {},
			price: 0,
			toLogin: false
		}

		Axios.get(`/api/provider`)
			.then(({ data }) => {
				const providers = data.providers.map(({ reference, name }) => ({
					value: reference,
					label: name
				}))
				this.setState({ providers })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

		Axios.get(`/api/article`)
			.then(({ data }) => {
				const articles = data.articles
					? data.articles.map(article => ({
							label: article.name,
							tva: article.tva,
							value: article.reference,
							category: article.category,
							price: article.buyingPriceU,
							date: article.addingDate,
							providers: new Set(
								article.providers.map(p => p.reference)
							)
					  }))
					: []
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
			orderRef: this.state.createdCommand.reference,
			articleRef: article.value,
			quantity: this.state.quantity,
			remise: 0,
			price: this.state.price
		}
		Axios.put('/api/order/article', object)
			.then(res => {
				console.log(res)
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	addArticle() {
		const ht = this.state.price * this.state.quantity
		let tva = ht * (this.state.article.tva / 100)
		const article = {
			...this.state.article,
			quantity: this.state.quantity,
			ht: ht,
			unitaire: this.state.price,
			ttc: ht + tva,
			tva: tva
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
			.then(res => {
				console.log(res.data.order)
				this.setState({ cmdCreated: true })
				this.setState({ createdCommand: res.data.order || {} })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	deleteCommande = () =>
		Axios.delete('/api/order', {
			data: {
				reference: this.state.createdCommand.reference
			}
		})
			.then(res => {
				this.setState({ addRedirect: true })
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

	deleteFromCommande = (id, index) =>
		Axios.delete('/api/order/article', {
			data: {
				reference: this.state.createdCommand.reference,
				id: id,
				index: index
			}
		}).catch(err => {
			if (err && err.response && err.response.status === 401)
				this.setState({ toLogin: true })
		})

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
							{row._original.quantity.toFixed(2)}
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
							{(Number(row._original.unitaire) || 0).toFixed(2)}
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
							{(Number(row._original.ht) || 0).toFixed(2)}
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
							{(Number(row._original.tva) || 0).toFixed(2)}
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
							{(Number(row._original.ttc) || 0).toFixed(2)}
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
							className='ion ion-md-trash text-danger px-4'
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
				{this.state.toLogin && <Redirect to='/' />}
				{this.state.addRedirect && <Redirect to='/achat/commande' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 pl-2 mb-4'>
					Ajouter une commande
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Fournisseur</Form.Label>
							<Select
								isSearchable={false}
								onChange={({ value }) =>
									this.setState({
										provider: value
									})
								}
								className='react-select'
								classNamePrefix='react-select'
								options={this.state.providers}
								defaultValue={this.state.providers[0]}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Référence</Form.Label>
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
							<Select
								className='react-select'
								classNamePrefix='react-select'
								onChange={({ label }) =>
									this.setState({
										paymentCond: label
									})
								}
								options={this.state.paymentConditions}
								defaultValue={this.state.paymentCond}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Délai de décaissement</Form.Label>
							<Form.Control
								type='number'
								value={this.state.nbDays}
								onChange={e =>
									this.setState({ nbDays: +e.target.value })
								}
							/>
						</Form.Group>
					</Form.Row>
					<div className='d-flex justify-content-end align-center'>
						<Button
							variant='primary'
							className='mx-2'
							onClick={this.createCommand}
							disabled={this.state.cmdCreated}>
							Créer
						</Button>
					</div>
					<br />
				</div>
				{this.state.cmdCreated && (
					<div>
						<div className='ui-bordered px-4 pt-4 mb-4'>
							<Form.Row>
								<Form.Group as={Col} md={4} className='mb-4'>
									<Form.Label>Article</Form.Label>
									<Select
										onChange={article =>
											this.setState({
												article,
												price: article.price
											})
										}
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
								<Form.Group
									as={Col}
									md={3}
									className='mb-4 mr-4'>
									<Form.Label>Prix Unitaire</Form.Label>
									<Form.Control
										onChange={e =>
											this.setState({
												price: e.target.value
											})
										}
										type='number'
										name='price'
										value={this.state.price}
									/>
								</Form.Group>
								<Form.Group
									as={Col}
									md={4}
									className='mb-4 mr-4'>
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
								<Form.Group
									as={Col}
									md={3}
									className='mb-4 mr-4'>
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
											!+this.state.price ||
											!this.state.quantity ||
											!this.state.article
										}
										onClick={this.addArticle}>
										Ajouter
									</Button>
								</Col>
							</Form.Row>
						</div>
						<div className='card-datatable table-responsive'>
							<ReactTable
								className='-striped -highlight'
								data={this.state.selectedArticles}
								columns={columns}
								defaultPageSize={10}
								previousText='&larr; Previous'
								nextText='Next &rarr;'
							/>
						</div>
					</div>
				)}
				<br />
				<div className='d-flex justify-content-end align-center'>
					{this.state.cmdCreated && (
						<Button
							variant='primary'
							className='mx-2'
							onClick={() =>
								this.setState({ addRedirect: true })
							}>
							Valider
						</Button>
					)}
					{this.state.cmdCreated && (
						<Button
							variant='danger'
							className='mx-2'
							onClick={this.deleteCommande}>
							Annuler
						</Button>
					)}
				</div>
			</div>
		)
	}
}

export default CreateCommande
