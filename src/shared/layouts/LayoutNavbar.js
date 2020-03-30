import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Navbar, Nav } from 'react-bootstrap'
import layoutHelpers from './helpers'
import Axios from 'axios'
import { Redirect } from 'react-router-dom'
class LayoutNavbar extends Component {
	constructor(props) {
		super(props)
		this.isRTL = document.documentElement.getAttribute('dir') === 'rtl'

		this.state = {
			toLogin: false
		}
	}

	toggleSidenav(e) {
		e.preventDefault()
		layoutHelpers.toggleCollapsed()
	}

	logout = () => {
		Axios.get('/api/logout')
			.then(res => {
				this.setState({ toLogin: true })
			})
			.catch(console.log)
	}

	render() {
		return (
			<Navbar
				bg={this.props.navbarBg}
				expand='lg'
				className='layout-navbar align-items-lg-center container-p-x'>
				{this.state.toLogin && <Redirect to='/' />}
				{this.props.sidenavToggle && (
					<Nav className='align-items-lg-center mr-auto mr-lg-4'>
						<Nav.Item
							as='a'
							className='nav-item nav-link px-0 ml-2 ml-lg-0'
							href='#toggle'
							onClick={this.toggleSidenav}>
							<i className='ion ion-md-menu text-large align-middle'></i>
						</Nav.Item>
					</Nav>
				)}
				<Navbar.Toggle />
				<Navbar.Collapse className='justify-content-end'>
					<Navbar.Brand to='/'>
						<span
							style={{ cursor: 'pointer' }}
							onClick={this.logout}>
							Logout
						</span>
					</Navbar.Brand>
				</Navbar.Collapse>
			</Navbar>
		)
	}
}

LayoutNavbar.propTypes = {
	sidenavToggle: PropTypes.bool
}

LayoutNavbar.defaultProps = {
	sidenavToggle: true
}

export default connect(store => ({
	navbarBg: store.theme.navbarBg
}))(LayoutNavbar)
