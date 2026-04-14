import type { GlossaryTerm } from '../../types'
import { authnMethodsTerms } from './authn-methods'
import { authzModelsTerms } from './authz-models'
import { oauthOidcTerms } from './oauth-oidc'
import { passwordlessTerms } from './passwordless'
import { mfaTerms } from './mfa'
import { authorizationPolicyEnginesTerms } from './authorization-policy-engines'

export {
  authnMethodsTerms,
  authzModelsTerms,
  oauthOidcTerms,
  passwordlessTerms,
  mfaTerms,
  authorizationPolicyEnginesTerms,
}

// Export all authentication terms combined
export const authenticationTerms: GlossaryTerm[] = [
  ...authnMethodsTerms,
  ...authzModelsTerms,
  ...oauthOidcTerms,
  ...passwordlessTerms,
  ...mfaTerms,
  ...authorizationPolicyEnginesTerms,
]
