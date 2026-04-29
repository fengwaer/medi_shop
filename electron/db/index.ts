import mssql from 'mssql';

// 主库连接池
const pool = new mssql.ConnectionPool({
    user: 'medi_shop',
    password: 'shop...123',
    server: '127.0.0.1',
    database: 'cox',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
});

//初始化连接
Promise.all([
  pool.connect(),
]).then(() => {
  console.log('MS连接成功！');
}).catch(err => {
  console.error('MS连接失败：', err);
});

export const query = async <T = any>(sql: string, params?: Record<string, any>): Promise<T> => {
  const request = pool.request();
  if (params) {
    // 自动循环对象并绑定参数
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
  }
  try {
    const result = await request.query(sql);
    return result.recordset as T; // SQL Server 返回结果在 recordset 中
  } catch (err) {
    throw err;
  }
};