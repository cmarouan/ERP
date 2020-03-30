import React from 'react'
import loadable from '@loadable/component'
import pMinDelay from 'p-min-delay'
import Loader from './shared/Loader'

// Layouts
import Layout2 from './shared/layouts/Layout2'
import Blank from './shared/layouts/LayoutBlank.js'

// Lazy load component
const lazy = cb =>
	loadable(() => pMinDelay(cb(), 200), { fallback: <Loader /> })

// ---
// Default application layout

export const DefaultLayout = Layout2

// ---
// Document title template

export const titleTemplate = 'Dahan Casablanca'

// ---
// Routes
//
// Note: By default all routes use { "exact": true }. To change this
// behaviour, pass "exact" option explicitly to the route object

export const defaultRoute = '/'
export const routes = [
	{
		path: '/',
		component: lazy(() => import('./components/user/Login')),
		layout: Blank
	},
	{
		path: '/achat/commande/create',
		component: lazy(() => import('./components/commande/AddCommande'))
	},
	{
		path: '/achat/commande',
		component: lazy(() => import('./components/commande/Commande'))
	},
	{
		path: '/achat/article',
		component: lazy(() => import('./components/article/Article'))
	},
	{
		path: '/achat/addArticle',
		component: lazy(() => import('./components/article/AddArticle'))
	},
	{
		path: '/achat/Fournisseur',
		component: lazy(() => import('./components/provider/Provider'))
	},
	{
		path: '/achat/AddFournisseur',
		component: lazy(() => import('./components/provider/AddProvider'))
	},
	{
		path: '/achat/Editfournisseur',
		component: lazy(() => import('./components/provider/EditPro'))
	},
	{
		path: '/achat/editArticle',
		component: lazy(() => import('./components/article/EditArticle'))
	},
	{
		path: '/achat/commande/edit',
		component: lazy(() => import('./components/commande/EditCommande'))
	},
	{
		path: '/achat/historique',
		component: lazy(() => import('./components/Achat/History'))
	},
	{
		path: '/vente/client',
		component: lazy(() => import('./components/Vente/Client/Client'))
	},
	{
		path: '/vente/editClient',
		component: lazy(() => import('./components/Vente/Client/EditClient'))
	},
	{
		path: '/vente/addClient',
		component: lazy(() => import('./components/Vente/Client/AddClient'))
	},
	{
		path: '/vente/historique',
		component: lazy(() => import('./components/Vente/History'))
	},
	{
		path: '/vente/commande',
		component: lazy(() => import('./components/Vente/Commande/Commande'))
	},
	{
		path: '/vente/commande/edit',
		component: lazy(() =>
			import('./components/Vente/Commande/EditCommande')
		)
	},
	{
		path: '/vente/commande/create',
		component: lazy(() => import('./components/Vente/Commande/AddCommande'))
	},
	{
		path: '/stock/réception',
		component: lazy(() => import('./components/stock/Receive'))
	},
	{
		path: '/stock/livraison',
		component: lazy(() => import('./components/stock/Deliver'))
	},
	{
		path: '/stock/etat',
		component: lazy(() => import('./components/stock/Etat/Etat'))
	},
	{
		path: '/stock/trace',
		component: lazy(() => import('./components/stock/Etat/Trace'))
	},
	{
		path: '/stock/adjust',
		component: lazy(() => import('./components/stock/Etat/Adjust'))
	},
	{
		path: '/comptabilité/à facturer',
		component: lazy(() => import('./components/accounting/ToFacture'))
	},
	{
		path: '/comptabilité/facture',
		component: lazy(() => import('./components/accounting/Facture'))
	},
	{
		path: '/comptabilité/réglement',
		component: lazy(() => import('./components/accounting/Reglement'))
	},
	{
		path: '/comptabilité/reglement/add',
		component: lazy(() => import('./components/accounting/AddReglement'))
	},
	{
		path: '/note de frais/note',
		component: lazy(() => import('./components/Note/Note'))
	},
	{
		path: '/note de frais/note/add',
		component: lazy(() => import('./components/Note/AddNote'))
	},
	{
		path: '/note de frais/note/edit',
		component: lazy(() => import('./components/Note/EditNote'))
	}
]
