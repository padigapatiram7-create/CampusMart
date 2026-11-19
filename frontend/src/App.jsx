import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { FiSearch, FiShoppingBag, FiUser, FiLogOut, FiHeart, FiChevronLeft, FiChevronRight, FiPlus, FiMinus, FiTrash2, FiPackage } from 'react-icons/fi'
import { apiFetch, clearTokens, getAccessToken, getRefreshToken, saveTokens } from './api'
import './App.css'

const categories = ['Books', 'Electronics', 'Hostel Essentials', 'Cycles', 'Sports']
const hostels = ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D']
const categoryImage = category => ({
  Books: '/images/books.jpg',
  Electronics: '/images/electronics.jpg',
  'Hostel Essentials': '/images/hostel-essentials.jpg',
  Cycles: '/images/cycles.jpg',
  Sports: '/images/sports.jpg',
}[category] || '/placeholder.svg')
const showCategoryImage = category => e => {
  const fallback = categoryImage(category)
  if (e.currentTarget.getAttribute('src') !== fallback) e.currentTarget.src = fallback
}

function useUser() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('campusmart_user')) } catch { return null }
  })
  return [user, (value) => { localStorage.setItem('campusmart_user', JSON.stringify(value)); setUser(value) }]
}

function Header({ user, setUser }) {
  const navigate = useNavigate()
  const logout = async () => {
    try { await apiFetch('/api/users/logout/', { method: 'POST', body: { refresh: getRefreshToken() } }) } catch {}
    clearTokens()
    setUser(null)
    navigate('/')
  }
  return <header className="header">
    <Link className="brand" to="/"><span className="brandMark">CM</span><span>Campus<span>Mart</span></span></Link>
    <nav>
      <Link to="/listings">Marketplace</Link>
      {user?.user_type === 'seller' && <Link to="/seller">Seller Center</Link>}
      {user && <Link to="/orders">My Orders</Link>}
    </nav>
    <div className="headerActions">
      {user ? <>
        <Link className="iconBtn" to="/cart" title="Cart"><FiShoppingBag /></Link>
        <button className="userChip" onClick={() => navigate(user.user_type === 'seller' ? '/seller' : '/orders')}><FiUser /> {user.username}</button>
        <button className="iconBtn" onClick={logout} title="Log out"><FiLogOut /></button>
      </> : <><Link className="loginLink" to="/login">Sign in</Link><Link className="primarySmall" to="/register">Join CampusMart</Link></>}
    </div>
  </header>
}

function ListingCard({ listing, onAdd }) {
  return <article className="listingCard">
    <Link to={`/listings/${listing.id}`} className="cardImage">
      <img src={listing.imageUrl || categoryImage(listing.category)} alt={listing.title} onError={showCategoryImage(listing.category)} />
      {listing.is_senior_deal && <span className="seniorBadge">Senior deal</span>}
      <button className="heart" onClick={e => e.preventDefault()}><FiHeart /></button>
    </Link>
    <div className="cardBody">
      <div className="cardMeta"><span>{listing.category}</span><span>{listing.rating || 4.5} ★</span></div>
      <Link to={`/listings/${listing.id}`}><h3>{listing.title}</h3></Link>
      <p>{listing.hostel} · {listing.condition}</p>
      <div className="cardFooter"><strong>₹{Number(listing.price).toLocaleString('en-IN')}</strong>{listing.negotiable && <span className="negotiable">Negotiable</span>}{onAdd && <button onClick={() => onAdd(listing)}><FiPlus /></button>}</div>
    </div>
  </article>
}

function ListingsPage({ user }) {
  const [data, setData] = useState({ results: [], count: 0 })
  const [senior, setSenior] = useState([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ search: '', submitted: '', category: '', hostel: '', rating: '', ordering: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page })
    if (filters.submitted) params.set('search', filters.submitted)
    if (filters.category) params.set('category', filters.category)
    if (filters.hostel) params.set('hostel', filters.hostel)
    if (filters.rating) params.set('rating', filters.rating)
    if (filters.ordering) params.set('ordering', filters.ordering)
    apiFetch(`/api/listings/?${params}`).then(setData).finally(() => setLoading(false)).catch(() => setLoading(false))
  }, [page, filters.category, filters.hostel, filters.rating, filters.ordering, filters.submitted])

  useEffect(() => {
    if (getAccessToken()) apiFetch('/api/listings/?is_senior_deal=true&page_size=6').then(d => setSenior(d.results)).catch(() => setSenior([]))
  }, [user])

  const add = async listing => {
    if (!getAccessToken()) return alert('Sign in to add items to your cart')
    await apiFetch('/api/cart/add/', { method: 'POST', body: { listing: listing.id, quantity: 1 } })
  }
  const submit = e => { e.preventDefault(); setPage(1); setFilters(f => ({ ...f, submitted: f.search })) }

  return <main className="page">
    <section className="marketHero"><div><span className="eyebrow">Campus community marketplace</span><h1>Great finds, <em>close to home.</em></h1><p>Buy and sell essentials with students across campus.</p></div><div className="heroStats"><strong>{data.count}</strong><span>active listings</span></div></section>
    {getAccessToken() ? senior.length > 0 && <section className="seniorStrip"><div><span>SENIOR-ONLY</span><b>Final-year clearance deals</b></div><div className="seniorRail">{senior.slice(0,4).map(l => <Link key={l.id} to={`/listings/${l.id}`}><img src={l.imageUrl || categoryImage(l.category)} alt="" onError={showCategoryImage(l.category)} /><span><b>{l.title}</b><strong>₹{Number(l.price).toLocaleString('en-IN')}</strong></span></Link>)}</div></section> : <section className="loginStrip"><b>Final-year clearance</b><span>Sign in to unlock Senior-Only Deals</span><Link to="/login">Sign in</Link></section>}
    <section className="marketLayout">
      <aside className="filters"><h3>Filters</h3><form onSubmit={submit}><label>Search<input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Title or hostel" /></label><button className="searchBtn" type="submit"><FiSearch /> Search</button></form>
        <label>Category<select value={filters.category} onChange={e => { setPage(1); setFilters(f => ({ ...f, category: e.target.value })) }}><option value="">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Hostel<select value={filters.hostel} onChange={e => { setPage(1); setFilters(f => ({ ...f, hostel: e.target.value })) }}><option value="">All hostels</option>{hostels.map(h => <option key={h}>{h}</option>)}</select></label>
        <label>Minimum rating<select value={filters.rating} onChange={e => { setPage(1); setFilters(f => ({ ...f, rating: e.target.value })) }}><option value="">Any rating</option>{[4, 4.5].map(r => <option key={r} value={r}>{r}+ stars</option>)}</select></label>
      </aside>
      <div className="marketContent"><div className="resultsBar"><span>{data.count} listings</span><select value={filters.ordering} onChange={e => { setPage(1); setFilters(f => ({ ...f, ordering: e.target.value })) }}><option value="">Featured</option><option value="price">Price: Low to High</option><option value="-price">Price: High to Low</option><option value="-rating">Highest Rated</option></select></div>
        {loading ? <div className="skeletonGrid">{[1,2,3,4,5,6].map(i => <div className="skeleton" key={i}/>)}</div> : data.results?.length ? <div className="listingGrid">{data.results.map(l => <ListingCard key={l.id} listing={l} onAdd={add}/>)}</div> : <div className="emptyState"><FiPackage /><h3>No listings found</h3><p>Try changing or clearing your filters.</p></div>}
        <div className="pagination"><button disabled={!data.previous} onClick={() => setPage(p => p - 1)}><FiChevronLeft /> Previous</button><span>Page {page} of {data.total_pages || 1}</span><button disabled={!data.next} onClick={() => setPage(p => p + 1)}>Next <FiChevronRight /></button></div>
      </div>
    </section>
  </main>
}

function AuthPage({ type, setUser }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', user_type: 'student' })
  const [error, setError] = useState('')
  const submit = async e => {
    e.preventDefault(); setError('')
    if (type === 'register') {
      if (form.password !== form.confirmPassword) return setError('Passwords do not match')
      try {
        await apiFetch('/api/users/register/', { method: 'POST', body: { username: form.username, email: form.email, password: form.password, user_type: form.user_type } })
        navigate('/login')
      } catch (err) { setError(err.message) }
    } else {
      try {
        const data = await apiFetch('/api/users/login/', { method: 'POST', body: { username: form.username, password: form.password } })
        saveTokens(data)
        const user = data.user
        localStorage.setItem('campusmart_user', JSON.stringify(user)); setUser(user)
        navigate(user.user_type === 'seller' ? '/seller' : '/listings')
      } catch (err) { setError(err.message) }
    }
  }
  return <main className="authPage"><form className="authCard" onSubmit={submit}><div className="authLogo">CM</div><span className="eyebrow">CampusMart</span><h1>{type === 'login' ? 'Welcome back' : 'Create your account'}</h1><p>{type === 'login' ? 'Sign in to your campus marketplace.' : 'Join students buying and selling nearby.'}</p>{error && <div className="errorBox">{error}</div>}
    <label>Username<input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></label>
    {type === 'register' && <><label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label><label>I am a<select value={form.user_type} onChange={e => setForm({...form, user_type: e.target.value})}><option value="student">Student / Buyer</option><option value="seller">Seller</option></select></label></>}
    <label>Password<input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></label>
    {type === 'register' && <label>Confirm password<input required type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} /></label>}
    <button className="authSubmit">{type === 'login' ? 'Sign in' : 'Create account'}</button>
    <p className="authSwitch">{type === 'login' ? <>New to CampusMart? <Link to="/register">Create account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</p>
  </form></main>
}

function DetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [quantity, setQuantity] = useState(1)
  useEffect(() => { apiFetch(`/api/listings/${id}/`).then(setListing).catch(() => setListing(null)) }, [id])
  const add = async () => { if (!getAccessToken()) return alert('Sign in to add items to your cart'); await apiFetch('/api/cart/add/', { method: 'POST', body: { listing: id, quantity } }); alert('Added to cart') }
  if (!listing) return <main className="page"><div className="emptyState">Loading listing…</div></main>
  return <main className="page detailPage"><div className="breadcrumbs">Marketplace / {listing.category}</div><section className="detailGrid"><div className="detailImage"><img src={listing.imageUrl || categoryImage(listing.category)} alt={listing.title} onError={showCategoryImage(listing.category)}/></div><div className="detailInfo"><span className="categoryPill">{listing.category}</span><h1>{listing.title}</h1><div className="detailRating">{listing.rating} ★ <span>{listing.total_reviews} reviews</span></div><div className="detailPrice">₹{Number(listing.price).toLocaleString('en-IN')} {listing.negotiable && <span>Negotiable</span>}</div><dl><div><dt>Hostel</dt><dd>{listing.hostel}</dd></div><div><dt>Condition</dt><dd>{listing.condition}</dd></div><div><dt>Availability</dt><dd className="available">{listing.availability}</dd></div></dl><p className="description">{listing.description}</p><div className="buyRow"><div className="quantity"><button onClick={() => setQuantity(q => Math.max(1,q-1))}><FiMinus/></button><span>{quantity}</span><button onClick={() => setQuantity(q => q+1)}><FiPlus/></button></div><button className="addCart" onClick={add}><FiShoppingBag /> Add to cart</button></div></div></section></main>
}

function CartPage({ navigate }) {
  const [cart, setCart] = useState({ items: [], total_price: '0.00' })
  const load = () => apiFetch('/api/cart/').then(setCart)
  useEffect(load, [])
  const update = async (item, quantity) => { await apiFetch(`/api/cart/items/${item.id}/`, { method: 'PATCH', body: { quantity } }); load() }
  const remove = async item => { await apiFetch(`/api/cart/items/${item.id}/`, { method: 'DELETE' }); load() }
  return <main className="page cartPage"><div className="sectionHeading"><span className="eyebrow">Your basket</span><h1>Shopping cart</h1></div>{cart.items.length ? <div className="cartGrid"><div className="cartItems">{cart.items.map(item => <article className="cartItem" key={item.id}><div className="cartThumb">#{item.listing}</div><div><span>{item.listing_condition}</span><h3>{item.listing_title}</h3><strong>₹{Number(item.listing_price).toLocaleString('en-IN')}</strong></div><div className="quantity"><button onClick={() => update(item, item.quantity-1)}><FiMinus/></button><span>{item.quantity}</span><button onClick={() => update(item, item.quantity+1)}><FiPlus/></button></div><button className="remove" onClick={() => remove(item)}><FiTrash2 /></button></article>)}</div><aside className="orderSummary"><h3>Order summary</h3><div><span>Subtotal</span><strong>₹{Number(cart.total_price).toLocaleString('en-IN')}</strong></div><div><span>Meetup fee</span><strong>Free</strong></div><hr/><div className="summaryTotal"><span>Total</span><strong>₹{Number(cart.total_price).toLocaleString('en-IN')}</strong></div><Link className="checkoutButton" to="/checkout">Proceed to checkout</Link></aside></div> : <div className="emptyState"><FiShoppingBag/><h3>Your cart is empty</h3><Link className="primarySmall" to="/listings">Browse listings</Link></div>}</main>
}

function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [], total_price: '0.00' })
  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '', state: '', pincode: '', meetup_point: 'Main Gate', payment_method: 'COD' })
  useEffect(() => { apiFetch('/api/cart/').then(setCart) }, [])
  const submit = async e => {
    e.preventDefault()
    try {
      const order = await apiFetch('/api/checkout/', { method: 'POST', body: { payment_method: form.payment_method, meetup_point: form.meetup_point, address: { full_name: form.full_name, phone: form.phone, address: form.address, city: form.city, state: form.state, pincode: form.pincode } } })
      navigate(`/orders/${order.id}`)
    } catch (err) { alert(err.message) }
  }
  return <main className="page checkoutPage"><div className="sectionHeading"><span className="eyebrow">Almost yours</span><h1>Checkout</h1></div><form onSubmit={submit} className="checkoutGrid"><section className="checkoutForm"><h3>Meetup details</h3><div className="formGrid">{[['full_name','Full name'],['phone','Phone'],['address','Address'],['city','City'],['state','State'],['pincode','PIN code']].map(([key,label]) => <label key={key}>{label}<input required value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}/></label>)}</div><h3>Payment</h3><div className="paymentOptions"><label className={form.payment_method==='COD'?'selected':''}><input type="radio" name="payment" checked={form.payment_method==='COD'} onChange={() => setForm({...form,payment_method:'COD'})}/><span><b>Cash at Meetup</b><small>Pay when you collect</small></span></label><label className={form.payment_method==='ONLINE'?'selected':''}><input type="radio" name="payment" checked={form.payment_method==='ONLINE'} onChange={() => setForm({...form,payment_method:'ONLINE'})}/><span><b>Pay Now</b><small>UPI or card (demo)</small></span></label></div><label>Meetup point<select value={form.meetup_point} onChange={e => setForm({...form,meetup_point:e.target.value})}><option>Main Gate</option><option>Library Steps</option><option>Canteen</option></select></label></section><aside className="orderSummary"><h3>In your cart</h3>{cart.items.map(i => <div className="summaryLine" key={i.id}><span>{i.quantity}× {i.listing_title}</span><strong>₹{(Number(i.listing_price)*i.quantity).toFixed(2)}</strong></div>)}<hr/><div className="summaryTotal"><span>Total</span><strong>₹{Number(cart.total_price).toLocaleString('en-IN')}</strong></div><button className="checkoutButton">Place order</button></aside></form></main>
}

function OrdersPage() {
  const [orders, setOrders] = useState([])
  useEffect(() => { apiFetch('/api/orders/').then(setOrders) }, [])
  return <main className="page"><div className="sectionHeading"><span className="eyebrow">Purchase history</span><h1>My Orders</h1></div>{orders.length ? <div className="orderList">{orders.map(o => <Link className="orderCard" to={`/orders/${o.id}`} key={o.id}><div><span>ORDER #{o.id}</span><h3>{o.item_count} item{o.item_count===1?'':'s'}</h3></div><span className={`status ${o.status}`}>{o.status}</span><strong>₹{Number(o.total).toLocaleString('en-IN')}</strong><FiChevronRight/></Link>)}</div> : <div className="emptyState"><FiPackage/><h3>No orders yet</h3><Link className="primarySmall" to="/listings">Start shopping</Link></div>}</main>
}

function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  useEffect(() => { apiFetch(`/api/orders/${id}/`).then(setOrder) }, [id])
  const cancel = async () => { const updated = await apiFetch(`/api/orders/${id}/cancel/`, { method:'POST' }); setOrder(updated) }
  if (!order) return <main className="page">Loading…</main>
  return <main className="page"><div className="sectionHeading"><span className="eyebrow">Order #{order.id}</span><h1>Order details</h1></div><div className="detailOrderGrid"><section className="checkoutForm">{order.items.map(i => <article className="orderItem" key={i.id}><img src={i.imageUrl || '/placeholder.svg'} alt="" onError={e => { if (!e.currentTarget.src.endsWith('/placeholder.svg')) e.currentTarget.src = '/placeholder.svg' }}/><div><h3>{i.title}</h3><p>{i.condition} · Qty {i.quantity}</p></div><span className={`status ${i.status}`}>{i.status}</span></article>)}{order.can_cancel && <button className="dangerBtn" onClick={cancel}>Cancel order</button>}</section><aside className="orderSummary"><h3>Delivery details</h3><p><b>{order.address.full_name}</b><br/>{order.address.address}<br/>{order.address.city}, {order.address.state} {order.address.pincode}</p><hr/><div><span>Meetup point</span><strong>{order.meetup_point}</strong></div><div><span>Payment</span><strong>{order.payment_method}</strong></div><hr/><div className="summaryTotal"><span>Total</span><strong>₹{Number(order.total).toLocaleString('en-IN')}</strong></div></aside></div></main>
}

function SellerPage() {
  const [tab,setTab]=useState('dashboard')
  const [dashboard,setDashboard]=useState(null)
  const [listings,setListings]=useState([])
  const [orders,setOrders]=useState([])
  const [editing,setEditing]=useState(null)
  const blank={title:'',hostel:'Hostel A',condition:'Good',negotiable:true,category:'Books',price:'',imageUrl:'',availability:'Available',is_senior_deal:false,description:''}
  const [form,setForm]=useState(blank)
  const load=async()=>{const [d,l,o]=await Promise.all([apiFetch('/api/seller/dashboard/'),apiFetch('/api/seller/listings/'),apiFetch('/api/seller/orders/')]);setDashboard(d);setListings(l.results||l);setOrders(o)}
  useEffect(()=>{load().catch(()=>{})},[])
  const advance=async item=>{await apiFetch(`/api/seller/orders/?item=${item.id}`,{method:'PATCH'});load()}
  const save=async e=>{
    e.preventDefault()
    const payload={...form,imageUrl:form.imageUrl||categoryImage(form.category)}
    if(editing)await apiFetch(`/api/seller/listings/${editing}/`,{method:'PATCH',body:payload})
    else await apiFetch('/api/seller/listings/',{method:'POST',body:payload})
    setEditing(null);setForm(blank);load()
  }
  const chooseImage=e=>{
    const file=e.target.files?.[0]
    if(!file)return
    if(file.size>2*1024*1024){alert('Please choose an image smaller than 2 MB');e.target.value='';return}
    const reader=new FileReader()
    reader.onload=()=>setForm(f=>({...f,imageUrl:reader.result}))
    reader.readAsDataURL(file)
  }
  const edit=l=>{setEditing(l.id);setForm({...l});setTab('listings')}
  const remove=async l=>{if(confirm('Delete this listing?')){await apiFetch(`/api/seller/listings/${l.id}/`,{method:'DELETE'});load()}}
  return <main className="page sellerPage"><aside className="sellerNav"><span>SELLER CENTER</span><button className={tab==='dashboard'?'active':''} onClick={()=>setTab('dashboard')}>Dashboard</button><button className={tab==='listings'?'active':''} onClick={()=>setTab('listings')}>My Listings</button><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>Seller Orders</button></aside><section className="sellerContent">{tab==='dashboard'&&dashboard&&<><div className="sectionHeading"><span className="eyebrow">Overview</span><h1>Seller dashboard</h1></div><div className="metricGrid"><Metric label="Total sales" value={`₹${dashboard.cards.sales.toLocaleString('en-IN')}`}/><Metric label="Orders" value={dashboard.cards.orders}/><Metric label="Still to hand over" value={dashboard.still_to_handover}/><Metric label="Active listings" value={dashboard.cards.listings}/></div><div className="dashboardGrid"><div className="chartCard"><h3>Last seven days</h3><div className="barChart">{dashboard.chart.map((b,i)=><div key={i}><span style={{height:`${Math.max(8,b.value/Math.max(1,Math.max(...dashboard.chart.map(x=>x.value)))*180)}px`}}/><b>{b.label}</b></div>)}</div></div><div className="statusCard"><h3>Items by status</h3>{dashboard.status_counts.map(s=><div key={s.status}><span className={`status ${s.status}`}>{s.status}</span><b>{s.count}</b></div>)}</div></div></>}
  {tab==='listings'&&<><div className="sectionHeading"><span className="eyebrow">Inventory</span><h1>My Listings</h1></div><form className="checkoutForm" onSubmit={save}><h3>{editing?'Edit listing':'Add listing'}</h3><div className="formGrid"><label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Hostel<select value={form.hostel} onChange={e=>setForm({...form,hostel:e.target.value})}>{hostels.map(h=><option key={h}>{h}</option>)}</select></label><label>Condition<select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}><option>Like New</option><option>Good</option><option>Fair</option></select></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Price<input required type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Listing image<input type="file" accept="image/*" onChange={chooseImage}/></label><label>Availability<select value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})}><option>Available</option><option>Sold</option></select></label><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label></div><div className="paymentOptions"><label className={form.negotiable?'selected':''}><input type="checkbox" checked={form.negotiable} onChange={e=>setForm({...form,negotiable:e.target.checked})}/> Negotiable</label><label className={form.is_senior_deal?'selected':''}><input type="checkbox" checked={form.is_senior_deal} onChange={e=>setForm({...form,is_senior_deal:e.target.checked})}/> Senior-only deal</label></div><button className="checkoutButton">{editing?'Save changes':'Add listing'}</button></form><div className="orderList">{listings.map(l=><article className="orderCard" key={l.id}><div><h3>{l.title}</h3><span>{l.category} · {l.hostel}</span></div><span className="status placed">{l.availability}</span><strong>₹{Number(l.price).toLocaleString('en-IN')}</strong><div><button className="iconBtn" onClick={()=>edit(l)}>Edit</button><button className="iconBtn" onClick={()=>remove(l)}><FiTrash2/></button></div></article>)}</div></>}
  {tab==='orders'&&<><div className="sectionHeading"><span className="eyebrow">Fulfilment</span><h1>Seller Orders</h1></div><div className="orderList">{orders.map(o=><article className="orderCard" key={o.id}><div><span>ORDER #{o.order_id}</span><h3>{o.listing}</h3></div><span className={`status ${o.status}`}>{o.status}</span><strong>₹{o.amount}</strong><button className="primarySmall" disabled={o.status==='delivered'||o.status==='cancelled'} onClick={()=>advance(o)}>{o.status==='placed'?'Mark shipped':'Mark delivered'}</button></article>)}</div></>}
  </section></main>
}
function Metric({label,value}){return <article className="metric"><span>{label}</span><strong>{value}</strong></article>}

function NotFound(){return <main className="page"><div className="emptyState"><h1>404</h1><p>That page is not on campus.</p><Link className="primarySmall" to="/">Go home</Link></div></main>}

function Protected({ user, children }) { return getAccessToken() ? children : <Navigate to="/login" replace /> }

export default function App(){
  const [user,setUser]=useUser()
  return <BrowserRouter><Header user={user} setUser={setUser}/><Routes>
    <Route path="/" element={<ListingsPage user={user}/>} />
    <Route path="/listings" element={<ListingsPage user={user}/>} />
    <Route path="/listings/:id" element={<DetailPage/>}/>
    <Route path="/login" element={<AuthPage type="login" setUser={setUser}/>}/>
    <Route path="/register" element={<AuthPage type="register" setUser={setUser}/>}/>
    <Route path="/cart" element={<Protected user={user}><CartPage/></Protected>}/>
    <Route path="/checkout" element={<Protected user={user}><CheckoutPage/></Protected>}/>
    <Route path="/orders" element={<Protected user={user}><OrdersPage/></Protected>}/>
    <Route path="/orders/:id" element={<Protected user={user}><OrderDetailPage/></Protected>}/>
    <Route path="/seller" element={<Protected user={user}><SellerPage/></Protected>}/>
    <Route path="*" element={<NotFound/>}/>
  </Routes></BrowserRouter>
}
