import { useState } from 'react'
import {
  createProduct,
  addProductDetails,
  activateProduct,
  getProduct,
  deleteProduct,
} from '../api'

const DEFAULT_DETAILS = {
  title: 'ThinkPad X1',
  code: 'TP-X1-001',
  variationType: 'NONE',
  details: {
    category: 'Computers',
    capacity: 512,
    capacityUnit: 'GB',
    capacityType: 'SSD',
    brand: 'Lenovo',
    series: 'ThinkPad',
  },
  about: ['Fast SSD', '16GB RAM'],
  description: 'A powerful laptop',
}

export function ProductFlow() {
  const [productId, setProductId] = useState<number | null>(null)
  const [getProductId, setGetProductId] = useState('')
  const [deleteProductId, setDeleteProductId] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [message, setMessage] = useState('')

  const show = (data: unknown, msg?: string) => {
    setResult(data as Record<string, unknown>)
    setMessage(msg || '')
  }

  const handleCreate = async () => {
    setMessage('')
    try {
      const res = await createProduct(1) // categoryId 1 = Computers
      const product = res.data.data
      setProductId(product.id)
      show(product, `Producto creado con id: ${product.id}`)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al crear producto')
    }
  }

  const handleAddDetails = async () => {
    if (!productId) return setMessage('Primero creá un producto')
    setMessage('')
    try {
      const res = await addProductDetails(productId, DEFAULT_DETAILS)
      show(res.data.data, 'Detalles agregados')
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al agregar detalles')
    }
  }

  const handleActivate = async () => {
    if (!productId) return setMessage('Primero creá un producto')
    setMessage('')
    try {
      const res = await activateProduct(productId)
      show(res.data.data, `Producto ${productId} activado — ¡revisá el panel de eventos!`)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al activar producto')
    }
  }

  const handleGet = async () => {
    setMessage('')
    try {
      const res = await getProduct(Number(getProductId))
      show(res.data.data)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Producto no encontrado')
    }
  }

  const handleDelete = async () => {
    setMessage('')
    try {
      const res = await deleteProduct(Number(deleteProductId))
      show(res.data.data, `Producto ${deleteProductId} eliminado`)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al eliminar producto')
    }
  }

  return (
    <div>
      <h3>Flujo de producto <small>(Admin / Merchant)</small></h3>

      <div style={{ marginBottom: '0.5rem' }}>
        <button onClick={handleCreate}>POST /product/create</button>
        {productId && <span> → id: {productId}</span>}
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <button onClick={handleAddDetails} disabled={!productId}>
          POST /product/{productId ?? ':id'}/details
        </button>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <button onClick={handleActivate} disabled={!productId}>
          POST /product/{productId ?? ':id'}/activate ⚡
        </button>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="number"
          placeholder="Product ID"
          value={getProductId}
          onChange={(e) => setGetProductId(e.target.value)}
        />
        <button onClick={handleGet}>GET /product/:id</button>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="number"
          placeholder="Product ID"
          value={deleteProductId}
          onChange={(e) => setDeleteProductId(e.target.value)}
        />
        <button onClick={handleDelete}>DELETE /product/:id</button>
      </div>

      {message && <p>{message}</p>}
      {result && <pre style={{ fontSize: '0.8rem' }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
