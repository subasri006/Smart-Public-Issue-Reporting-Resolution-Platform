# CivicFix — Rule-Based Priority Scoring Formula

> [!NOTE]
> CivicFix employs an **explainable, deterministic, rule-based mathematical formula** for priority scoring. It does **not** use an opaque black-box AI or machine-learning model, ensuring 100% transparency, auditability, and legal fairness for municipal governance.

---

## 1. Mathematical Formula

Every complaint in CivicFix receives an automated integer priority score computed according to the following formula:

$$\text{Priority Score} = W_{\text{severity}} + W_{\text{category}} + W_{\text{age}}$$

Where:
- $W_{\text{severity}}$ represents the inherent hazard or impact level of the issue.
- $W_{\text{category}}$ represents the municipal department urgency weighting (configurable by administrators in database).
- $W_{\text{age}}$ represents an escalation factor that increases gradually as an unresolved issue ages.

---

## 2. Weight Parameters & Ranges

### 2.1 Severity Weight ($W_{\text{severity}}$)
Defined by the `com.civicfix.enums.Severity` enumeration:

| Severity Level | Base Weight | Real-world Criteria |
| :--- | :---: | :--- |
| **`LOW`** | **10** | Minor cosmetic defect, non-hazardous graffiti, minor litter. |
| **`MEDIUM`** | **25** | Single burnt streetlight, standard pothole, non-overflowing trash bin. |
| **`HIGH`** | **50** | Broken water main, large sinkhole, multiple dark street blocks. |
| **`CRITICAL`** | **80** | Exposed live electrical cables, open deep manhole, toxic spill, gas leak. |

### 2.2 Category Weight ($W_{\text{category}}$)
Configured per category in the `complaint_categories` table (`default_weight` column). Default baseline values:

| Category Name | Configured Weight ($W_{\text{category}}$) | Municipal Rationale |
| :--- | :---: | :--- |
| **Public Safety** | **30** | Direct threat to citizen life, physical safety, or security. |
| **Water Supply** | **25** | Essential public utility required for sanitation and drinking. |
| **Drainage** | **20** | Urban flooding hazard and sewer line backup prevention. |
| **Road Damage** | **20** | Vehicular collision prevention and transit flow maintenance. |
| **Garbage** | **15** | Public health, pest control, and neighborhood sanitation. |
| **Streetlight** | **15** | Nighttime visibility and pedestrian crime deterrence. |
| **Other** | **10** | General civic inquiries and miscellaneous maintenance. |

Administrators can dynamically fine-tune these weights via the **Category Management** console (`/admin/categories`).

### 2.3 Age Escalation Weight ($W_{\text{age}}$)
To ensure older, neglected issues receive increasing attention without allowing low-severity complaints to eclipse true emergencies, age weight accrues at a predictable rate of **2 points per day**, capped at a maximum of **20 points**:

$$W_{\text{age}} = \min(\text{Days Open} \times 2,\, 20)$$

*Note: For complaints created today ($\text{days} = 0$), $W_{\text{age}} = 0$.*

---

## 3. Priority Level Classification

The total score maps to one of four intuitive operational priority bands:

| Computed Score Range | Priority Level | UI Badge & SLA Target |
| :---: | :---: | :--- |
| **Score $\ge 80$** *(or `CRITICAL` severity)* | **`CRITICAL`** | Red badge — Response within **2–4 hours** |
| **$55 \le \text{Score} < 80$** | **`HIGH`** | Orange badge — Response within **24–48 hours** |
| **$30 \le \text{Score} < 55$** | **`MEDIUM`** | Amber/Yellow badge — Response within **3–5 business days** |
| **$\text{Score} < 30$** | **`LOW`** | Blue/Gray badge — Routine scheduling (within **10 business days**) |

*Critical Severity Override: Any complaint submitted with `CRITICAL` severity is automatically assigned `CRITICAL` priority regardless of category or age.*

---

## 4. Worked Calculation Examples

### Example A: Fresh Critical Safety Hazard
- **Issue**: Exposed high-voltage electrical cable in school park.
- **Severity**: `CRITICAL` ($W_{\text{severity}} = 80$)
- **Category**: `Public Safety` ($W_{\text{category}} = 30$)
- **Complaint Age**: 0 days ($W_{\text{age}} = 0$)
- **Calculation**: $80 + 30 + 0 = 110$
- **Result**: **Priority Score = 110 (CRITICAL Priority)**

### Example B: Fresh Pothole Report
- **Issue**: Deep pothole on 4th Avenue.
- **Severity**: `MEDIUM` ($W_{\text{severity}} = 25$)
- **Category**: `Road Damage` ($W_{\text{category}} = 20$)
- **Complaint Age**: 0 days ($W_{\text{age}} = 0$)
- **Calculation**: $25 + 20 + 0 = 45$
- **Result**: **Priority Score = 45 (MEDIUM Priority)**

### Example C: Neglected Pothole Escalation
- **Issue**: Same pothole after 8 days of pending status.
- **Severity**: `MEDIUM` ($W_{\text{severity}} = 25$)
- **Category**: `Road Damage` ($W_{\text{category}} = 20$)
- **Complaint Age**: 8 days ($W_{\text{age}} = \min(8 \times 2, 20) = 16$)
- **Calculation**: $25 + 20 + 16 = 61$
- **Result**: **Priority Score = 61 (Escalated to HIGH Priority)**

---

## 5. Source Code Implementation Reference

Implemented in [`PriorityScoringService.java`](file:///c:/Users/ASUS/OneDrive/Desktop/Smart%20Public%20Issue%20Reporting%20&%20Resolution%20Platform/backend/src/main/java/com/civicfix/service/PriorityScoringService.java):

```java
int severityWeight = severity != null ? severity.getDefaultWeight() : 25;
int categoryWeight = category != null ? category.getDefaultWeight() : 10;
long daysOld = createdAt != null ? ChronoUnit.DAYS.between(createdAt, LocalDateTime.now()) : 0;
int ageWeight = (int) Math.min(daysOld * pointsPerDay, maxAgeWeight);

int totalScore = severityWeight + categoryWeight + ageWeight;
```
