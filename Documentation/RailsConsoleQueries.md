# Rails Console & Serializer Guide for Admin Data

Use these commands to inspect and expose the backend objects the React app relies on (users list, current grades, primary/secondary syllabi, belts).

## Start Console

```bash
bundle exec rails console
```

## Discover Associations (avoid typos)

```ruby
Syllabus.reflect_on_all_associations.map(&:name)
Belt.reflect_on_all_associations.map(&:name)
User.reflect_on_all_associations.map(&:name)
TechniqueType.reflect_on_all_associations.map(&:name)
Technique.reflect_on_all_associations.map(&:name)
```

## Syllabus → Belts → TechniqueTypes → Techniques

```ruby
id = 1 # replace with your syllabus ID
s = Syllabus.includes(:belts, technique_types: [:belt, :techniques]).find(id)

# Quick counts
s.belts.size
s.technique_types.size
s.technique_types.first.techniques.size

# Techniques for a syllabus via join
Technique.joins(:technique_type).where(technique_types: { syllabus_id: s.id }).count

# Techniques per belt in a syllabus
Belt.where(syllabus_id: s.id).map { |b|
  [b.colour, Technique.joins(:technique_type).where(technique_types: { syllabus_id: s.id, belt_id: b.id }).count]
}.to_h
```

## Belt with nested associations

```ruby
belt_id = 1
b = Belt.includes(:technique_types, :techniques, :belt_grades).find(belt_id)

b.technique_types.size
b.techniques.size # if has_many :techniques, through: :technique_types exists
b.belt_grades.size
```

## User with current belt + instructor qualification

```ruby
user_id = 1
u = User.includes(current_belt_grade: :belt, :current_instructor_qualification).find(user_id)

u.current_belt_grade&.belt
u.current_instructor_qualification
```

## Admin Flags (Primary / Secondary Syllabus)

````ruby
# Current primary / secondary
Syllabus.find_by(is_primary_admin_syllabus: true)
Syllabus.find_by(is_secondary_admin_syllabus: true)

# If field names drifted, check variants
Syllabus.pluck(:id, :country, :year, :is_primary_admin_syllabus, :is_secondary_admin_syllabus, :is_primary_admin, :primary_admin, :is_secondary_admin, :secondary_admin)

# Normalize by SQL OR (pick only the first true row if multiple)
primary = Syllabus.find_by(is_primary_admin_syllabus: true)
secondary = Syllabus.find_by(is_secondary_admin_syllabus: true)

# If columns may vary across environments, first check what exists:
Syllabus.column_names
# Then build a safe OR only using existing columns:
cols = Syllabus.column_names
pri_cols = cols & ["is_primary_admin_syllabus", "is_primary_admin", "primary_admin"]
sec_cols = cols & ["is_secondary_admin_syllabus", "is_secondary_admin", "secondary_admin"]
primary = pri_cols.any? ? Syllabus.where(pri_cols.map { |c| "#{c} = TRUE" }.join(" OR ")).first : nil
secondary = sec_cols.any? ? Syllabus.where(sec_cols.map { |c| "#{c} = TRUE" }.join(" OR ")).first : nil

## Belts for Primary Syllabus

```ruby
primary = Syllabus.where("is_primary_admin_syllabus = TRUE OR is_primary_admin = TRUE OR primary_admin = TRUE").first
Belt.where(syllabus_id: primary.id).order(:kyu_number).pluck(:id, :colour, :kyu_number)
````

## Users With Current Grade (Effective Kyu)

```ruby
users = User.includes(current_belt_grade: :belt).limit(20)
users.map { |x| [x.id, x.first_name, x.last_name, x.current_belt_grade&.belt&.kyu_number] }
```

## Serializer Recommendations (ActiveModelSerializers)

SyllabusSerializer:

```ruby
class SyllabusSerializer < ActiveModel::Serializer
  attributes :id, :country, :year, :is_primary_admin_syllabus, :is_secondary_admin_syllabus
  has_many :belts
end
```

BeltSerializer:

```ruby
class BeltSerializer < ActiveModel::Serializer
  attributes :id, :colour, :kyu_number, :syllabus_id
end
```

BeltGradeSerializer (derive `effective_kyu_grade` from belt):

```ruby
class BeltGradeSerializer < ActiveModel::Serializer
  attributes :id, :belt_id, :grade_name, :obtained_at, :effective_kyu_grade
  belongs_to :belt

  def effective_kyu_grade
    object&.belt&.kyu_number
  end
end
```

UserSerializer (expose current grade):

```ruby
class UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email
  has_one :current_belt_grade
  has_one :current_instructor_qualification
end
```

## Controller Actions (Syllabi)

```ruby
class SyllabiController < ApplicationController
  def index
    syllabi = Syllabus.includes(:belts).all
    render json: syllabi
  end

  def get_primary
    syllabus = Syllabus.includes(:belts).find_by(is_primary_admin_syllabus: true)
    if syllabus
      render json: syllabus
    else
      render json: { error: "No primary syllabus set" }, status: :not_found
    end
  end

  def get_secondary
    syllabus = Syllabus.includes(:belts).find_by(is_secondary_admin_syllabus: true)
    if syllabus
      render json: syllabus
    else
      render json: { error: "No secondary syllabus set" }, status: :not_found
    end
  end
end
```

## API Verification via curl

Assuming the Rails server runs at `http://localhost:3000` and uses session cookies.

```bash
curl -i http://localhost:3000/syllabi/get_primary
curl -i http://localhost:3000/syllabi/get_secondary
curl -i http://localhost:3000/syllabi
curl -i http://localhost:3000/users
```

````

## JSON output (ActiveModelSerializers, JSON:API)

```ruby
# Single syllabus with nested includes
s = Syllabus.find(1)
ActiveModelSerializers::SerializableResource.new(
  s,
  include: [
    :belts,
    { technique_types: [:belt, :techniques] }
  ]
).as_json

# Collection
ActiveModelSerializers::SerializableResource.new(
  Syllabus.all,
  include: [
    :belts,
    { technique_types: [:belt, :techniques] }
  ]
).as_json

# String include syntax also works
ActiveModelSerializers::SerializableResource.new(
  s,
  include: ["belts", "technique_types", "technique_types.belt", "technique_types.techniques"]
).as_json
````

## JSON without AMS (quick as_json)

```ruby
Syllabus.find(1).as_json(include: [
  :belts,
  { technique_types: { include: [:belt, :techniques] } }
])

Belt.find(1).as_json(include: [:technique_types, :techniques, :belt_grades])

User.find(1).as_json(include: {
  current_belt_grade: { include: :belt },
  current_instructor_qualification: {}
})
```

## Debug SQL in console

```ruby
ActiveRecord::Base.logger = Logger.new(STDOUT)
# then execute a query to see eager loading behavior
Syllabus.includes(:belts, technique_types: [:belt, :techniques]).find(1)
```

## Common pitfalls

- Do not paste placeholders like `<ID>`; use integers (e.g., `1`).
- Match association names exactly; e.g., `Syllabus` has `:technique_types`, not `:techniques` (techniques come via `TechniqueType`).
- Prefer `.includes` to avoid N+1 queries when exploring nesting.
