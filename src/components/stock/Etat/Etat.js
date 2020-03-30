import axios from 'axios'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form, Col, Button } from 'react-bootstrap'
import Select from 'react-select'
import ReactTable from 'react-table'
import '../../../vendor/libs/react-table/react-table.scss'
import '../../../vendor/libs/react-select/react-select.scss'

export default class Etat extends Component {
	state = {
		articles: [],
		filtered: [],
		traceRedirect: false,
		notLogged: false
	}

	addRedirect = () => this.setState({ traceRedirect: true })

	filterCategory = ({ label }) =>
		this.setState({
			filtered:
				label === 'Toute'
					? this.state.articles
					: this.state.articles.filter(a => a.category === label)
		})

	filterName = ({ label }) =>
		this.setState({
			filtered:
				label === 'Toute'
					? this.state.articles
					: this.state.articles.filter(a => a.name === label)
		})

	componentDidMount() {
		axios
			.get('/api/article')
			.then(res =>
				this.setState({
					articles: res.data.articles,
					filtered: res.data.articles
				})
			)
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)
	}

	render() {
		const columns = [
			{ Header: 'Référence', accessor: 'reference' },
			{ Header: 'Article', accessor: 'name' },
			{ Header: 'Catégorie', accessor: 'category' },
			{
				Header: 'Quantité Disponible',
				Cell: ({ row }) => (
					<div
						className='d-flex justify-content-center'
						style={{ width: '100%' }}>
						<span className='ml-auto mr-2'>
							{row._original.stock.toFixed(2)}
						</span>
					</div>
				)
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.traceRedirect && <Redirect to='/stock/adjust' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Etat de stock
					<div className='d-flex justify-content-between align-items-center'>
						<Button
							onClick={this.addRedirect}
							variant='outline-primary rounded-pill mr-2 d-block'>
							<span className='ion ion-md-code-working' />
							&nbsp; Ajustement
						</Button>
					</div>
				</h4>
				<div className='ui-bordered px-4 pt-4 mb-4'>
					<Form.Row>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Categorie</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								onChange={this.filterCategory}
								defaultValue={{ label: 'Toute' }}
								options={[
									'Toute',
									...[
										...new Set(
											this.state.articles.map(
												({ category }) => category
											)
										)
									]
								].map(x => ({ label: x }))}
							/>
						</Form.Group>
						<Form.Group as={Col} md={6} className='mb-4'>
							<Form.Label>Article</Form.Label>
							<Select
								className='react-select'
								classNamePrefix='react-select'
								onChange={this.filterName}
								defaultValue={{ label: 'Toute' }}
								options={[
									'Toute',
									...[
										...new Set(
											this.state.articles.map(
												({ name }) => name
											)
										)
									]
								].map(x => ({ label: x }))}
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
