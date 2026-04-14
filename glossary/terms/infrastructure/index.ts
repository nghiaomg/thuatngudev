import type { GlossaryTerm } from '../../types'
import { cpuMetricsTerms } from './cpu-metrics'
import { memoryMetricsTerms } from './memory-metrics'
import { diskIoTerms } from './disk-io'
import { networkMetricsTerms } from './network-metrics'
import { containerK8sTerms } from './container-k8s'

export {
  cpuMetricsTerms,
  memoryMetricsTerms,
  diskIoTerms,
  networkMetricsTerms,
  containerK8sTerms,
}

// Export all infrastructure terms combined
export const infrastructureTerms: GlossaryTerm[] = [
  ...cpuMetricsTerms,
  ...memoryMetricsTerms,
  ...diskIoTerms,
  ...networkMetricsTerms,
  ...containerK8sTerms,
]
