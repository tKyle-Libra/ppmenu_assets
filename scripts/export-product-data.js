#!/usr/bin/env node

/**
 * 从 SQLite 数据库导出商品数据到 JSON 文件
 */

const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

// 数据库路径
const DB_PATH = path.join(__dirname, '../db/ppmenu.db')

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../../product-list-vite/public/db')

// 每页数据量
const PAGE_SIZE = 20

console.log('🔍 开始从数据库导出商品数据...')

// 主函数
function main() {
  try {
    // 1. 连接数据库
    console.log(`📂 打开数据库: ${DB_PATH}`)
    const db = new Database(DB_PATH, { readonly: true })

    // 2. 查询所有商品数据（关联品牌表）
    console.log('📊 查询商品数据...')
    const query = `
      SELECT
        p.*,
        b.brand_name
      FROM product p
      LEFT JOIN brand b ON p.brand_id = b.brand_id
      ORDER BY p.product_id
    `

    const products = db.prepare(query).all()

    console.log(`✅ 查询到 ${products.length} 条商品数据`)

    // 3. 处理数据
    const processedProducts = products.map(product => {
      // 处理图片路径（数据库中已经是完整路径，直接拼接CDN）
      const productImg = `https://cdn.jsdelivr.net/gh/tKyle-Libra/ppmenu_assets@0.0.6/${product.product_img}`

      // 处理口味（从 product_img 中提取，或使用其他逻辑）
      const productTastes = []

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        brand_id: product.brand_id,
        brand_name: product.brand_name || '',
        product_img: productImg,
        product_weight: product.product_weight,
        product_eat_type: product.product_eat_type,
        product_is_new: product.product_is_new || 0,
        product_type_id: product.product_type_id,
        product_type_name: '', // 需要从类型表获取，暂时为空
        product_tastes: productTastes,
        is_young: 0, // 是否有幼猫口味
        is_snacks: 0 // 是否有零食
      }
    })

    // 4. 获取类型名称
    console.log('📋 查询商品类型数据...')
    const types = db.prepare('SELECT * FROM product_type').all()

    // 构建类型ID到名称的映射
    const typeMap = {}
    types.forEach(type => {
      typeMap[type.product_type_id] = type.product_type_name
    })

    // 5. 获取口味数据
    console.log('🍽️ 查询商品口味数据...')
    const tastes = db.prepare('SELECT * FROM product_taste').all()

    // 构建商品ID到口味列表的映射
    const tasteMap = {}
    tastes.forEach(taste => {
      if (!tasteMap[taste.product_id]) {
        tasteMap[taste.product_id] = {
          tastes: [],
          is_young: false,
          is_snacks: false
        }
      }
      tasteMap[taste.product_id].tastes.push(taste.product_taste_name)

      // 标记是否有幼猫口味
      if (taste.is_young === 1) {
        tasteMap[taste.product_id].is_young = true
      }

      // 标记是否有零食
      if (taste.is_snacks === 1) {
        tasteMap[taste.product_id].is_snacks = true
      }
    })

    // 6. 更新商品的类型名称和口味
    processedProducts.forEach(product => {
      // 设置类型名称
      if (product.product_type_id && typeMap[product.product_type_id]) {
        product.product_type_name = typeMap[product.product_type_id]
      }

      // 设置口味列表和相关标记
      if (tasteMap[product.product_id]) {
        product.product_tastes = tasteMap[product.product_id].tastes

        // 标记是否有幼猫口味
        product.is_young = tasteMap[product.product_id].is_young ? 1 : 0

        // 标记是否有零食
        product.is_snacks = tasteMap[product.product_id].is_snacks ? 1 : 0
      }
    })

    console.log(`✅ 加载了 ${types.length} 个商品类型`)
    console.log(`✅ 加载了 ${tastes.length} 个口味数据`)

    // 7. 分页处理
    const totalPages = Math.ceil(processedProducts.length / PAGE_SIZE)
    console.log(`📄 生成 ${totalPages} 页数据...`)

    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
      console.log(`📁 创建输出目录: ${OUTPUT_DIR}`)
    }

    // 8. 写入分页文件
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * PAGE_SIZE
      const end = start + PAGE_SIZE
      const pageData = processedProducts.slice(start, end)

      const fileName = `data-page${page}.json`
      const filePath = path.join(OUTPUT_DIR, fileName)

      fs.writeFileSync(
        filePath,
        JSON.stringify(pageData, null, 2),
        'utf-8'
      )

      console.log(`✅ 已生成: ${fileName} (${pageData.length}条)`)
    }

    // 9. 关闭数据库连接
    db.close()

    console.log(`\n🎉 数据导出完成!`)
    console.log(`📊 总计: ${processedProducts.length} 条商品`)
    console.log(`📄 分页: ${totalPages} 页 × ${PAGE_SIZE} 条/页`)
    console.log(`📂 输出目录: ${OUTPUT_DIR}`)

  } catch (error) {
    console.error('\n❌ 导出失败:', error)
    process.exit(1)
  }
}

// 运行
main()
