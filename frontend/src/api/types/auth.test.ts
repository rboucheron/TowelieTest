import { describe, it, expect } from 'vitest'
import { LoginInputSchema, MeResultSchema } from './auth'

describe('LoginInputSchema', () => {
  it('accepts a valid login payload', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@b.com',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = LoginInputSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = LoginInputSchema.safeParse({
      email: 'a@b.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('MeResultSchema', () => {
  it('parses a user with memberships across groups', () => {
    const result = MeResultSchema.safeParse({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        isSuperAdmin: false,
      },
      memberships: [{ groupId: 'g1', groupName: 'Group 1', role: 'QA' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an unknown role', () => {
    const result = MeResultSchema.safeParse({
      user: {
        id: 'u1',
        email: 'a@b.com',
        firstName: 'A',
        lastName: 'B',
        isSuperAdmin: false,
      },
      memberships: [{ groupId: 'g1', groupName: 'Group 1', role: 'OWNER' }],
    })
    expect(result.success).toBe(false)
  })
})
