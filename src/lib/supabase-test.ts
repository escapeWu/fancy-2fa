/**
 * Supabase CRUD 测试脚本
 * 运行方式: npx tsx src/lib/supabase-test.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rtodqwwojomnsbegwvce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0b2Rxd3dvam9tbnNiZWd3dmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzMzNDUsImV4cCI6MjA4NTMwOTM0NX0.71_QOue0BkruKIWe-R60-7f3XDylgtq0kBz4SALCYhw'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCRUD() {
  console.log('🧪 开始 Supabase CRUD 测试...\n')

  // 测试表名 - 使用一个测试表
  const tableName = 'test_accounts'

  // 0. 检查表是否存在，尝试使用 rpc 创建表
  console.log('0️⃣ 检查/创建测试表...')

  // 尝试查询表，如果失败说明表不存在
  const { error: checkError } = await supabase.from(tableName).select('id').limit(1)

  if (checkError && checkError.message.includes('Could not find')) {
    console.log('   表不存在，请在 Supabase 控制台运行以下 SQL 创建表:\n')
    console.log(`   CREATE TABLE ${tableName} (
     id BIGSERIAL PRIMARY KEY,
     issuer TEXT NOT NULL,
     account TEXT NOT NULL,
     secret TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 允许匿名用户进行 CRUD 操作 (仅用于测试)
   ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow all for anon" ON ${tableName} FOR ALL USING (true);
`)
    return
  }
  console.log('✅ 表存在，继续测试...')

  // 1. CREATE - 插入测试数据
  console.log('\n1️⃣ CREATE - 插入数据...')
  const testData = {
    issuer: 'TestIssuer',
    account: 'test@example.com',
    secret: 'JBSWY3DPEHPK3PXP',
    created_at: new Date().toISOString()
  }

  const { data: insertData, error: insertError } = await supabase
    .from(tableName)
    .insert(testData)
    .select()

  if (insertError) {
    console.log(`❌ CREATE 失败: ${insertError.message}`)
    console.log(`   提示: 可能需要先在 Supabase 控制台创建 '${tableName}' 表`)
    console.log(`   表结构建议: id (int8, primary key), issuer (text), account (text), secret (text), created_at (timestamptz)`)
    return
  }
  console.log('✅ CREATE 成功:', insertData)
  const insertedId = insertData?.[0]?.id

  // 2. READ - 读取数据
  console.log('\n2️⃣ READ - 读取数据...')
  const { data: readData, error: readError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', insertedId)
    .single()

  if (readError) {
    console.log(`❌ READ 失败: ${readError.message}`)
    return
  }
  console.log('✅ READ 成功:', readData)

  // 3. UPDATE - 更新数据
  console.log('\n3️⃣ UPDATE - 更新数据...')
  const { data: updateData, error: updateError } = await supabase
    .from(tableName)
    .update({ issuer: 'UpdatedIssuer' })
    .eq('id', insertedId)
    .select()

  if (updateError) {
    console.log(`❌ UPDATE 失败: ${updateError.message}`)
    return
  }
  console.log('✅ UPDATE 成功:', updateData)

  // 4. DELETE - 删除数据
  console.log('\n4️⃣ DELETE - 删除数据...')
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq('id', insertedId)

  if (deleteError) {
    console.log(`❌ DELETE 失败: ${deleteError.message}`)
    return
  }
  console.log('✅ DELETE 成功')

  // 验证删除
  const { data: verifyData } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', insertedId)

  if (verifyData?.length === 0) {
    console.log('✅ 验证删除成功 - 数据已不存在')
  }

  console.log('\n🎉 所有 CRUD 测试通过!')
}

testCRUD().catch(console.error)
