import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Sidenav from '../../vendor/libs/sidenav'
import layoutHelpers from './helpers'
import { Link } from 'react-router-dom'
import logo from '../../logo.png'
import logo2 from '../../logo2.png'

class LayoutSidenav extends Component {
	constructor(props) {
		super(props)
		this.navMenus = [
			{
				name: 'Achat',
				items: ['Commande', 'Article', 'Fournisseur', 'Historique']
			},
			{
				name: 'Stock',
				items: [
					'Réception',
					'Livraison',
					'Etat de stock',
					'Traçabilité'
				]
			},
			{
				name: 'Vente',
				items: ['Commande', 'Client', 'Historique']
			},
			{
				name: 'Comptabilité',
				items: ['À Facturer', 'Facture', 'Réglement']
			},
			{
				name: 'Note de frais',
				items: ['Note de frais']
			}
		]

		this.state = {
			collapssed: false
		}
	}

	layoutSidenavClasses() {
		let bg = this.props.sidenavBg

		if (
			this.props.orientation === 'horizontal' &&
			(bg.indexOf(' sidenav-dark') !== -1 ||
				bg.indexOf(' sidenav-light') !== -1)
		) {
			bg = bg
				.replace(' sidenav-dark', '')
				.replace(' sidenav-light', '')
				.replace('-darker', '')
				.replace('-dark', '')
		}

		return (
			`bg-${bg} ` +
			(this.props.orientation !== 'horizontal'
				? 'layout-sidenav'
				: 'layout-sidenav-horizontal container-p-x flex-grow-0')
		)
	}

	toggleSidenav = e => {
		e.preventDefault()
		this.setState(state => ({ collapssed: !state.collapssed }))
		layoutHelpers.toggleCollapsed()
	}

	isMenuActive(url) {
		return this.props.location.pathname.indexOf(url) === 0
	}

	isMenuOpen(url) {
		return (
			this.props.location.pathname.indexOf(url) === 0 &&
			this.props.orientation !== 'horizontal'
		)
	}

	generateLink(menu, item) {
		const link =
			item !== 'Tableau de bord'
				? item !== 'Etat de stock'
					? item !== 'Traçabilité'
						? item !== 'Note de frais'
							? item
							: 'note'
						: 'trace'
					: 'etat'
				: 'stat'
		return `/${menu.toLowerCase()}/${link.toLowerCase()}`
	}

	render() {
		return (
			<Sidenav
				orientation={this.props.orientation}
				className={this.layoutSidenavClasses()}>
				<div className='app-brand d-flex'>
					<Link to='/' className='app-brand-logo my-3 pl-1'>
						<img
							alt='logo'
							style={{ width: this.state.collapssed ? 50 : 110 }}
							src={this.state.collapssed ? logo2 : logo}
						/>
					</Link>
					<a
						href='#toggle'
						className='layout-sidenav-toggle sidenav-link text-large ml-auto'
						onClick={this.toggleSidenav}>
						<i className='ml-3 ion ion-md-menu align-middle'></i>
					</a>
				</div>
				<Sidenav.Divider className='mt-0' />
				<div
					className={`sidenav-inner ${
						this.props.orientation !== 'horizontal' ? 'py-1' : ''
					}`}>
					{this.navMenus.map((menu, i) => (
						<Sidenav.Menu
							key={i}
							icon='ion ion-md-speedometer'
							linkText={menu.name}
							active={this.isMenuActive(`/${menu.name}s`)}
							open={this.isMenuOpen(`/${menu.name}s`)}>
							{menu.items.map(link => (
								<Sidenav.RouterLink
									key={link}
									to={this.generateLink(menu.name, link)}>
									{link}
								</Sidenav.RouterLink>
							))}
						</Sidenav.Menu>
					))}
				</div>
			</Sidenav>
		)
	}
}

LayoutSidenav.propTypes = {
	orientation: PropTypes.oneOf(['vertical', 'horizontal'])
}

LayoutSidenav.defaultProps = {
	orientation: 'vertical'
}

export default connect(store => ({
	sidenavBg: store.theme.sidenavBg
}))(LayoutSidenav)
