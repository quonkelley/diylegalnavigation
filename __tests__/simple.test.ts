describe('Simple Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('Hello ' + 'World').toBe('Hello World')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async test')
    expect(result).toBe('async test')
  })
}) 