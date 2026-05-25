;; Ayapay Stacks Contract
;; Equivalent to the Celo/Soroban implementation with batch, STX support, events, and admin management

;; Reference the standard SIP-010 trait on Mainnet
(use-trait sip-010-trait .sip-010-trait-ft-standard.sip-010-trait)

;; Admin definition
(define-data-var admin principal tx-sender)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-employee-not-found (err u101))
(define-constant err-employee-not-active (err u102))
(define-constant err-invalid-token (err u103))
(define-constant err-batch-empty (err u104))

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

;; Admin management
(define-public (update-admin (new-admin principal))
  (begin
    (asserts! (is-admin) err-unauthorized)
    (var-set admin new-admin)
    (print { event: "admin-updated", new-admin: new-admin })
    (ok true)
  )
)

;; Employee management
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
    (print { event: "employee-added", employee-id: employee-id, wallet: wallet, salary: salary, token: token })
    (ok true)
  )
)

(define-public (update-employee (employee-id principal) (wallet principal) (salary uint) (token principal))
  (begin
    (asserts! (is-admin) err-unauthorized)
    (asserts! (is-some (map-get? employees employee-id)) err-employee-not-found)
    
    (map-set employees
      employee-id
      {
        wallet: wallet,
        salary: salary,
        token: token,
        active: true
      }
    )
    (print { event: "employee-updated", employee-id: employee-id, wallet: wallet, salary: salary, token: token })
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
        (print { event: "employee-removed", employee-id: employee-id })
        (ok true)
      )
      err-employee-not-found
    )
  )
)

;; Payments
(define-public (pay-employee (employee-id principal) (amount uint) (token-trait <sip-010-trait>))
  (let ((emp (unwrap! (map-get? employees employee-id) err-employee-not-found)))
    (asserts! (is-admin) err-unauthorized)
    (asserts! (get active emp) err-employee-not-active)
    ;; token-trait contract must match the registered token principal
    (asserts! (is-eq (contract-of token-trait) (get token emp)) err-invalid-token)
    
    (try! (contract-call? token-trait transfer amount tx-sender (get wallet emp) none))
    (print { event: "payment-made", employee-id: employee-id, token: (get token emp), amount: amount })
    (ok true)
  )
)

(define-public (pay-employee-stx (employee-id principal) (amount uint))
  (let ((emp (unwrap! (map-get? employees employee-id) err-employee-not-found)))
    (asserts! (is-admin) err-unauthorized)
    (asserts! (get active emp) err-employee-not-active)
    
    (try! (stx-transfer? amount tx-sender (get wallet emp)))
    (print { event: "payment-made-stx", employee-id: employee-id, amount: amount })
    (ok true)
  )
)

;; Batch payment helper
(define-private (pay-batch-stx-iter (payment {employee-id: principal, amount: uint}))
  (let ((emp (unwrap-panic (map-get? employees (get employee-id payment)))))
    ;; Just do a transfer, if it fails panic (aborts whole tx)
    (unwrap-panic (stx-transfer? (get amount payment) tx-sender (get wallet emp)))
    (print { event: "payment-made-stx", employee-id: (get employee-id payment), amount: (get amount payment) })
    true
  )
)

;; Pay multiple employees in STX
(define-public (pay-employees-batch-stx (payments (list 100 {employee-id: principal, amount: uint})))
  (begin
    (asserts! (is-admin) err-unauthorized)
    (asserts! (> (len payments) u0) err-batch-empty)
    
    (map pay-batch-stx-iter payments)
    (print { event: "batch-payment-stx-complete", count: (len payments) })
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-employee (employee-id principal))
  (map-get? employees employee-id)
)

(define-read-only (get-admin)
  (var-get admin)
)
