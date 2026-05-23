;; Ayapay Stacks Contract
;; Equivalent to the Celo/Soroban implementation

;; Reference the standard SIP-010 trait on Mainnet
(use-trait sip-010-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Admin definition
(define-data-var admin principal tx-sender)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-employee-not-found (err u101))
(define-constant err-employee-not-active (err u102))

;; Data maps
(define-map employees
  principal
  {
    wallet: principal,
    salary: uint,
    token: principal,
    active: bool
  }
)

;; Private functions
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Public functions
(define-public (add-employee (employee-id principal) (wallet principal) (salary uint) (token principal))
  (begin
    (asserts! (is-admin) err-unauthorized)
    
    (map-set employees
      employee-id
      {
        wallet: wallet,
        salary: salary,
        token: token,
        active: true
      }
    )
    (ok true)
  )
)

(define-public (remove-employee (employee-id principal))
  (begin
    (asserts! (is-admin) err-unauthorized)
    (match (map-get? employees employee-id)
      emp
      (begin
        (map-set employees employee-id
          (merge emp { active: false })
        )
        (ok true)
      )
      err-employee-not-found
    )
  )
)

(define-public (pay-employee (employee-id principal) (amount uint) (token-trait <sip-010-trait>))
  (let ((emp (unwrap! (map-get? employees employee-id) err-employee-not-found)))
    (asserts! (is-admin) err-unauthorized)
    (asserts! (get active emp) err-employee-not-active)
    ;; token-trait contract must match the registered token principal
    (asserts! (is-eq (contract-of token-trait) (get token emp)) (err u103))
    
    (contract-call? token-trait transfer amount tx-sender (get wallet emp) none)
  )
)

;; Read-only functions
(define-read-only (get-employee (employee-id principal))
  (map-get? employees employee-id)
)
