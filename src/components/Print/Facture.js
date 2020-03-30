import React, { Component } from 'react'
import logo from '../../logo_print.png'
import moment from 'moment'
import Wnumber from 'written-number'

Wnumber.defaults.lang = 'fr'

const styles = {
	main: {
		padding: '2rem',
		fontFamily: `"Roboto", -apple-system, BlinkMacSystemFont,
			"Segoe UI", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
			"Droid Sans", "Helvetica Neue", sans-serif`,
		display: 'flex',
		flexDirection: 'column',
		height: '100vh'
	},
	addresse: {
		marginTop: '5rem',
		marginLeft: 'auto',
		width: '20%',
		display: 'flex',
		flexDirection: 'column',
		fontSize: '1.15em'
	},
	bold: {
		fontWeight: 700
	},
	topCase: {
		width: '17%',
		display: 'flex',
		flexDirection: 'column'
	},
	mainFacture: {
		fontWeight: 700,
		margin: '.75rem 0',
		paddingBottom: '.5rem',
		borderBottom: '.75px solid #00000099'
	},
	mainFactureCol: (s = 20) => ({
		width: `${s}%`,
		display: 'flex',
		flexDirection: 'column'
	}),
	price: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '.25rem .5rem',
		borderTop: '.75px solid #00000099'
	},
	taxes: {
		fontWeight: 700,
		margin: '.5rem 0',
		paddingBottom: '.5rem',
		borderBottom: '.75px solid #00000099'
	},
	end: {
		textAlign: 'end'
	},
	topFacture: {
		margin: '3rem 0 2rem',
		fontSize: '1.7em'
	},
	mx5: {
		margin: '.5rem 0'
	},
	footer: {
		width: '100%',
		marginTop: 'auto',
		paddingTop: '.5rem',
		textAlign: 'center',
		borderTop: '1px solid #00000099'
	}
}

export default class Facture extends Component {
	constructor(props) {
		super(props)
		this.facture = this.props.facture
		this.order = this.facture.order
		this.client =
			this.props.deliver || typeof this.facture.client === 'object'
				? this.facture.client
				: this.order.client
		this.articles = this.props.deliver
			? this.facture && this.facture.articles
			: this.order && this.order.articles
		this.priceT = this.props.deliver
			? this.facture.priceT
			: this.order
			? this.order.priceT
			: this.facture.total
		this.days = this.props.deliver
			? this.facture.days
			: this.order
			? this.order.days
			: '0'
		this.type = this.props.deliver ? 'BL' : 'FACTURE'
	}

	toLetters = nb =>
		`ARRETER LA PRESENTE FACTURE A LA SOMME DE ${Wnumber(
			nb
		).toUpperCase()} DIRHAM${
			(nb - ~~nb) * 100
				? ` ${Wnumber((nb - ~~nb) * 100).toUpperCase()} CENTIMES`
				: ``
		}`

	render() {
		return (
			<div style={styles.main}>
				<div style={{ display: 'flex' }}>
					<img
						alt='logo'
						style={{
							width: '250px',
							margin: '5rem 0 7rem 2rem'
						}}
						src={logo}
					/>
					<div style={styles.addresse}>
						{this.client.name !== 'NONE' && (
							<span>{this.client.name}</span>
						)}
						{this.client.address !== 'NONE' && (
							<span>{this.client.address}</span>
						)}
						{this.client.address2 !== 'NONE' && (
							<span>{this.client.address2}</span>
						)}
						{this.client.city !== 'NONE' && (
							<span>{this.client.city}</span>
						)}
						{this.client.country !== 'NONE' && (
							<span>{this.client.country}</span>
						)}
					</div>
				</div>
				<div style={styles.topFacture}>
					<span>{`${this.type} N°: `}</span>
					<span style={styles.bold}>{this.facture.reference}</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div style={styles.topCase}>
						<span style={{ ...styles.bold, ...styles.mx5 }}>
							Date de facture:
						</span>
						<span>
							{moment(this.facture.date).format('DD/MM/YYYY')}
						</span>
					</div>
					{!this.props.deliver && (
						<div style={styles.topCase}>
							<span style={{ ...styles.bold, ...styles.mx5 }}>
								Date d'échéance:
							</span>
							<span>
								{moment(this.facture.echoDate).format(
									'DD/MM/YYYY'
								)}
							</span>
						</div>
					)}
					<div style={styles.topCase}>
						<span style={{ ...styles.bold, ...styles.mx5 }}>
							Source:
						</span>
						<span>{this.facture.type > 0 ? 'BR' : 'BL'}</span>
					</div>
					<div style={styles.topCase}>
						<span style={{ ...styles.bold, ...styles.mx5 }}>
							Code Client:
						</span>
						<span>{this.client.reference}</span>
					</div>
					<div style={styles.topCase}>
						<span style={{ ...styles.bold, ...styles.mx5 }}>
							Commercial:
						</span>
						<span>
							{this.facture.commercial || this.order.commercial}
						</span>
					</div>
				</div>
				<div
					style={{
						margin: '3rem 0'
					}}>
					<div
						style={{
							width: '100%',
							display: 'flex'
						}}>
						<div
							style={{
								...styles.mainFactureCol(40),
								...styles.mainFacture
							}}>
							Description:
						</div>
						<div
							style={{
								...styles.mainFactureCol(),
								...styles.mainFacture,
								...styles.end
							}}>
							Quantité:
						</div>
						<div
							style={{
								...styles.mainFactureCol(),
								...styles.mainFacture,
								...styles.end
							}}>
							Prix Unitaire:
						</div>
						<div
							style={{
								...styles.mainFactureCol(),
								...styles.mainFacture,
								...styles.end
							}}>
							Montant:
						</div>
					</div>
					{(this.articles || []).map(article => (
						<div
							key={article._id}
							style={{
								width: '100%',
								display: 'flex'
							}}>
							<div
								style={{
									...styles.mainFactureCol(40)
								}}>
								{article.article.name}
							</div>
							<div
								style={{
									...styles.mainFactureCol(),
									...styles.end
								}}>
								{article.quantity}
							</div>
							<div
								style={{
									...styles.mainFactureCol(),
									...styles.end
								}}>
								{article.price.toFixed(2) + ' MAD'}
							</div>
							<div
								style={{
									...styles.mainFactureCol(),
									...styles.end
								}}>
								{article.totalPrice.toFixed(2) + ' MAD'}
							</div>
						</div>
					))}
				</div>
				<div
					style={{
						width: '40%',
						marginLeft: 'auto',
						display: 'flex',
						flexDirection: 'column'
					}}>
					<div style={styles.price}>
						<span
							style={{
								...styles.bold,
								...styles.mx5
							}}>
							Total HT
						</span>
						<span>{this.priceT.toFixed(2) + ' MAD'}</span>
					</div>
					<div style={styles.price}>
						<span
							style={{
								...styles.bold,
								...styles.mx5
							}}>
							Taxes
						</span>
						<span>{(+this.priceT * 0.2).toFixed(2) + ' MAD'}</span>
					</div>
					<div
						style={{
							...styles.price,
							...styles.bold,
							fontSize: '1.25em'
						}}>
						<span
							style={{
								...styles.mx5
							}}>
							Total TTC
						</span>
						<span>{(+this.priceT * 1.2).toFixed(2) + ' MAD'}</span>
					</div>
				</div>
				<div
					style={{
						width: '50%',
						display: 'flex',
						marginTop: '3rem'
					}}>
					<div style={styles.mainFactureCol(33)}>
						<span style={styles.taxes}>Taxes</span>
						<span>TVA 20% VENTES</span>
					</div>
					<div style={styles.mainFactureCol(33)}>
						<span
							style={{
								...styles.taxes,
								...styles.end
							}}>
							Base de calcul
						</span>
						<span style={styles.end}>
							{this.priceT.toFixed(2) + ' MAD'}
						</span>
					</div>
					<div style={styles.mainFactureCol(33)}>
						<span
							style={{
								...styles.taxes,
								...styles.end
							}}>
							Montant
						</span>
						<span style={styles.end}>
							{(+this.priceT * 0.2).toFixed(2) + ' MAD'}
						</span>
					</div>
				</div>
				<div
					style={{
						margin: '2.5rem 0'
					}}>
					<span style={{ ...styles.bold, marginRight: '1rem' }}>
						Conditions de règlement:
					</span>
					<span>{this.days + ' Jours'}</span>
				</div>
				<div
					style={{
						...styles.bold,
						fontSize: '1.2em'
					}}>
					{this.toLetters(+this.priceT * 1.2)}
				</div>
				<div style={styles.footer}>
					<div>
						DAHAN CASABLANCA s.a.r.l - Siège social: 2 Rue N°50,
						Magasin N°2 et 6, Hay Ousra 2, Casablanca - Tél:
						+212522724631
					</div>
					<div>
						Taxe professionelle 34082333 - IF 20734658 - RC 368495 -
						ICE 001860529000077
					</div>
				</div>
			</div>
		)
	}
}
