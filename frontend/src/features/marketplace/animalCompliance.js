export function getAnimalComplianceBadgeTypes(animal = {}) {
  const badges = []

  if (animal.author?.isProfessionalVerified) {
    badges.push('professionalApproved')
  }

  if (animal.onssaAuthorizationNumber) {
    badges.push('onssaProvided')
  }

  const documentaryStatus = animal.documentaryStatus ?? 'unverified'

  if (documentaryStatus === 'documents_verified_by_yazoo') {
    badges.push('documentsVerifiedByYazoo')
  } else if (documentaryStatus === 'under_review') {
    badges.push('documentsUnderReview')
  } else if (documentaryStatus === 'rejected') {
    badges.push('documentsRejected')
  } else {
    badges.push('documentsUnverified')
  }

  const legalStatus = animal.legalStatus ?? 'pending_review'

  if (legalStatus === 'approved') {
    badges.push('animalApproved')
  } else if (legalStatus === 'suspended') {
    badges.push('animalSuspended')
  } else if (legalStatus === 'rejected') {
    badges.push('animalRejected')
  } else {
    badges.push('animalPending')
  }

  if (
    legalStatus === 'pending_review' &&
    (animal.healthCertificatePath || animal.vaccinationBookPath || animal.sellerType === 'professional')
  ) {
    badges.push('documentsPending')
  }

  return [...new Set(badges)]
}
