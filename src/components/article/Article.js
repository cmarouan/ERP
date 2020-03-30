import axios from 'axios'
import moment from 'moment'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { Form, Col, Button } from 'react-bootstrap'
import { useFilter } from '../../filter'
import ReactTable from 'react-table'
import '../../vendor/libs/react-table/react-table.scss'
import '../../vendor/libs/react-select/react-select.scss'
import '../../vendor/libs/nouislider-react/nouislider-react.scss'
import '../../vendor/libs/react-datepicker/react-datepicker.scss'

export default class Article extends Component {
	state = {
		addRedirect: false,
		articles: [],
		filtered: [],
		startDate: new Date(),
		endDate: new Date(),
		rangeValue: ['0', '1000'],
		data: [],
		toLogin: false
	}

	options = [
		{
			label: 'Toute'
		},
		{
			label: 'Disponible'
		},
		{
			label: 'Non Disponible'
		}
	]

	dates = ['start', 'end']

	addRedirect = () => this.setState({ addRedirect: true })

	componentDidMount() {
		const getMinDate = arr =>
			arr
				.map(({ addingDate }) => new Date(addingDate))
				.sort((a, b) => a - b)[0]
		axios
			.get('/api/article')
			.then(res => {
				console.log(res.data.articles)
				this.setState({ articles: res.data.articles })
				this.setState({ filtered: res.data.articles })
				this.setState({
					startDate: getMinDate(res.data.articles)
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})
	}

	setDates({
		startDate = this.state.startDate,
		endDate = this.state.endDate
	}) {
		if (moment(startDate).isAfter(endDate)) {
			endDate = startDate
		}
		this.setState({
			startDate,
			endDate
		})
	}

	removeArticle = reference =>
		axios
			.delete('/api/article', { data: { reference } })
			.then(res => {
				const refCmp = cur => cur.reference !== reference
				this.setState(state => {
					console.log(state)
					return {
						articles: state.articles.filter(refCmp),
						filtered: state.filtered.filter(refCmp)
					}
				})
			})
			.catch(err => {
				if (err && err.response && err.response.status === 401)
					this.setState({ toLogin: true })
			})

	handleChange(type, date) {
		this.setDates({ [`${type}Date`]: date })
		this.setState({
			filtered: useFilter(this.state.articles, 'date', {
				start: this.state.startDate,
				end: this.state.endDate,
				[type]: date,
				key: 'addingDate'
			})
		})
	}

	filterNameArt = e => {
		if (e.label === 'Toute')
			this.setState({ filtered: this.state.articles })
		else {
			console.log(e.label)
			let filter = this.state.articles.filter(ele => ele.name === e.label)
			this.setState({ filtered: filter })
		}
	}

	handleDispQuan = ({ label }) => {
		let data = this.state.articles
		if (label === 'Toute') this.setState({ filtered: data })
		else if (label === 'Disponible')
			this.setState({
				filtered: data.filter(ar => ar.stock > 0)
			})
		else
			this.setState({
				filtered: data.filter(ar => ar.stock < 1)
			})
	}

	render() {
		const columns = [
			{
				Header: 'Article',
				accessor: 'name'
			},

			{
				Header: 'Catégorie',
				accessor: 'category'
			},
			{
				Header: 'Référence',
				accessor: 'reference'
			},
			{
				Header: 'Fournisseur',
				Cell: ({ row }) =>
					row._original.providers.length
						? row._original.providers[0].name
						: 'Non défini'
			},
			{
				Header: 'TVA',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.tva + '%'}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Public',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.sellingPriceU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Revient',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.pricePrefU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Dahan',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.priceDahanU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Intermédiaire',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.priceInterU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Prix Magasin',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.priceMagasinU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: "Prix d'achat",
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.buyingPriceU.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: "Date d'ajout",
				Cell: ({ row }) =>
					moment(row._original.addingDate).format('DD/MM/YYYY')
			},
			{
				Header: 'Quantité',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.stock.toFixed(2)}
						</span>
					</div>
				)
			},
			{
				Header: 'Modifier',
				Cell: ({ row, index }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span
							style={{
								cursor: 'pointer'
							}}
							onClick={() =>
								this.setState({
									articleToEdit: row._original,
									editRedirect: true
								})
							}
							className='ion ion-md-create text-primary'
						/>
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
							style={{
								cursor: 'pointer'
							}}
							onClick={() =>
								this.removeArticle(row._original.reference)
							}
							className='ion ion-md-trash text-danger'
						/>
					</div>
				)
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.addRedirect && <Redirect to='/achat/addArticle' />}
				{this.state.toLogin && <Redirect to='/' />}
				{this.state.editRedirect && (
					<Redirect
						to={{
							pathname: '/achat/editArticle',
							state: {
								article: this.state.articleToEdit
							}
						}}
					/>
				)}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					<div>Articles</div>
					<div className='d-flex justify-content-between align-items-center'>
						<Button
							onClick={this.addRedirect}
							variant='outline-primary rounded-pill mr-2 d-block'>
							<span className='ion ion-md-create' />
							&nbsp; Créer
						</Button>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						{this.dates.map(date => (
							<Form.Group key={date} as={Col} md={3}>
								<Form.Label>{`Date (${
									date === 'start' ? 'début' : 'fin'
								})`}</Form.Label>
								<DatePicker
									className='form-control'
									selected={this.state[`${date}Date`]}
									onChange={value =>
										this.handleChange(date, value)
									}
									popperPlacement={this.placement}
								/>
							</Form.Group>
						))}
						<Form.Group as={Col} md={3} className='mb-4'>
							<Form.Label>Articles</Form.Label>
							<Select
								isSearchable={true}
								onChange={this.filterNameArt}
								className='react-select'
								classNamePrefix='react-select'
								options={[
									{ name: 'Toute' },
									...new Set(this.state.articles)
								].map(art => ({ label: art.name }))}
								defaultValue={{ label: 'Toute' }}
							/>
						</Form.Group>
						<Form.Group as={Col} md={3} className='mb-4'>
							<Form.Label>Quantité disponible</Form.Label>
							<Select
								isSearchable={false}
								onChange={this.handleDispQuan}
								className='react-select'
								classNamePrefix='react-select'
								options={this.options}
								defaultValue={this.options[0]}
							/>
						</Form.Group>
					</Form.Row>
				</div>
				<div className='card-datatable table-responsive'>
					<ReactTable
						className='-striped -highlight'
						data={this.state.filtered}
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
			</div>
		)
	}
}
