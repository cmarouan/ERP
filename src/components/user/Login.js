import React, { Component } from 'react'
import Axios from 'axios'
import { Redirect } from 'react-router-dom'
import { Form, Row, Button, Col } from 'react-bootstrap'
import logo from '../../logo_print.png'
import sideLogo from '../../login.svg'
import bg from '../../bg.png'

export default class Login extends Component {
	state = {
		username: '',
		password: '',
		toHome: false,
		loaded: false
	}

	onChange = e => this.setState({ [e.target.name]: e.target.value })

	onConnect = e => {
		e.preventDefault()
		Axios.post('/api/user/login', {
			username: this.state.username,
			password: this.state.password
		})
			.then(res => this.setState({ toHome: true }))
			.catch(err => {
				this.setState({ toHome: false })
				console.log(err.response)
			})
	}

	componentDidMount() {
		Axios.get('/api/logged')
			.then(res => this.setState({ toHome: true }))
			.catch(err => this.setState({ loaded: true }))
	}

	render() {
		return (
			<div
				style={{
					height: '100vh',
					fontSize: '1.2em',
					backgroundImage: `url(${bg})`,
					backgroundSize: 'cover',
					backgroundPosition: 'bottom right'
				}}
				className='container-fluid card'>
				{this.state.toHome && <Redirect to='/achat/commande' />}
				{this.state.loaded && (
					<Row className='d-flex align-items-center h-100'>
						<Col
							lg={{ offset: 1, span: 4 }}
							md={{ offset: 2, span: 8 }}
							sm={{ offset: 1, span: 10 }}>
							<div className='d-flex justify-content-center align-center pb-3 mb-5'>
								<img
									style={{
										width: '30vmax'
									}}
									src={logo}
									alt='logo'
								/>
							</div>
							<Form onSubmit={this.onConnect} className='w-100'>
								<Form.Group>
									<Form.Label>Login</Form.Label>
									<Form.Control
										type='text'
										name='username'
										onChange={this.onChange}
									/>
								</Form.Group>
								<Form.Group>
									<Form.Label>Mot de passe</Form.Label>
									<Form.Control
										type='password'
										name='password'
										onChange={this.onChange}
									/>
								</Form.Group>
								<div className='d-flex justify-content-between align-items-center m-0'>
									<Button
										type='submit'
										variant='primary'
										className='rounded-pill ml-auto mt-4'
										style={{
											fontWeight: '700',
											background: '#fff',
											color: '#4E5155'
										}}>
										Connect
									</Button>
								</div>
							</Form>
						</Col>
						<Col lg={7} className='d-none d-lg-block'>
							<img
								src={sideLogo}
								style={{
									width: '75%',
									position: 'absolute',
									left: '50%',
									top: '50%',
									transform: 'translate(-50%, -50%)'
								}}
								alt='bg'
							/>
						</Col>
					</Row>
				)}
			</div>
		)
	}
}
