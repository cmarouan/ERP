import axios from 'axios'
import React, { Component } from 'react'
import { Redirect } from 'react-router'
import { Form } from 'react-bootstrap'
import ReactTable from 'react-table'
import '../../../vendor/libs/react-table/react-table.scss'

export default class Adjust extends Component {
	state = {
		filtered: [],
		notLogged: false,
		reel: {}
	}

	adjustStock = ref =>
		axios
			.patch('/api/stock/article', {
				reference: ref,
				quantity: this.state.reel[ref]
			})
			.then(res =>
				this.setState({
					message: res.data.message,
					filtered: this.state.filtered.map(cur => ({
						...cur,
						stock:
							cur.reference === ref
								? this.state.reel[ref]
								: cur.stock
					}))
				})
			)
			.catch(err =>
				err.response && err.response.status === 401
					? this.setState({ notLogged: true })
					: console.log(err.response)
			)

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

	handleInputChange = (row, event) => {
		let reel = { ...this.state.reel }
		reel[row.reference] = +event.target.value
		this.setState({ reel })
	}

	renderInput = ({ row }) => (
		<div
			className='d-flex'
			style={{
				maxWidth: 150,
				margin: '0 auto'
			}}>
			<Form.Control
				size='sm'
				type='number'
				onChange={this.handleInputChange.bind(null, row)}
				value={this.state.reel[row.reference] || row.stock}
			/>
			<span
				onClick={() => this.adjustStock(row.reference)}
				style={{
					cursor: 'pointer',
					transform: 'scale(1.25)'
				}}
				className='ion ion-md-checkmark text-success px-3 pt-1'
			/>
		</div>
	)

	render() {
		const columns = [
			{ Header: 'Référence', accessor: 'reference' },
			{ Header: 'Article', accessor: 'name' },
			{
				Header: 'Quantité Système',
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
				Header: 'Quantité Réelle',
				Cell: this.renderInput
			},
			{
				Header: 'Écart',
				Cell: ({ row }) =>
					this.state.reel[row.reference] ? (
						<div
							className='d-flex justify-content-center'
							style={{ width: '100%' }}>
							<span
								className='ml-auto mr-2'
								style={{
									color:
										this.state.reel[row.reference] -
											row.stock >=
										0
											? '#00C851'
											: '#ff4444'
								}}>
								{this.state.reel[row.reference] !== row.stock
									? (
											this.state.reel[row.reference] -
											row.stock
									  ).toFixed(2)
									: ''}
							</span>
						</div>
					) : null
			}
		]

		return (
			<div className='container-fluid flex-grow-1 container-p-y'>
				{this.state.notLogged && <Redirect to='/' />}
				{this.state.traceRedirect && <Redirect to='/stock/trace' />}
				<h4 className='d-flex justify-content-between align-items-center w-100 font-weight-bold py-3 mb-4'>
					Ajustement
				</h4>
				<div className='card-datatable table-responsive'>
					<ReactTable
						className='-striped -highlight'
						data={this.state.filtered}
						columns={columns}
						defaultPageSize={20}
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
				{this.state.message && (
					<div className='alert alert-success' role='alert'>
						{this.state.message}
					</div>
				)}
			</div>
		)
	}
}
